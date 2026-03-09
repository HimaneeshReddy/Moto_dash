import pool from "../config/db.js";
import format from "pg-format";

// ─────────────────────────────────────────────────────────────────
// GET /api/data/datasets — list all datasets for an org
// ─────────────────────────────────────────────────────────────────
export const listDatasets = async (req, res, next) => {
    try {
        const { organizationId } = req.user;
        const result = await pool.query(
            `SELECT id, name, storage_table_name, row_count, column_count, created_at
             FROM datasets WHERE organization_id = $1 ORDER BY created_at DESC`,
            [organizationId]
        );
        return res.json({ datasets: result.rows });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/data/:id/rows — paginated + optional search
// Query params: page (default 1), limit (default 50), search
// ─────────────────────────────────────────────────────────────────
export const getDatasetRows = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    try {
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (meta.rows.length === 0) return res.status(404).json({ message: "Dataset not found." });

        const tableName = meta.rows[0].storage_table_name;

        // Build a CAST-safe search across all text columns using information_schema
        let rows, totalCount;
        if (search) {
            // Dynamically find all non-_id text columns
            const colRes = await pool.query(
                `SELECT column_name FROM information_schema.columns 
                 WHERE table_name = $1 AND column_name != '_id' ORDER BY ordinal_position`,
                [tableName]
            );
            const cols = colRes.rows.map(r => r.column_name);
            // Build: col1::text ILIKE '%search%' OR col2::text ILIKE '%search%' ...
            const conditions = cols.map(col => format("%I::text ILIKE %L", col, `%${search}%`)).join(" OR ");
            const rowRes = await pool.query(
                `SELECT * FROM ${format('%I', tableName)} WHERE ${conditions} LIMIT ${limit} OFFSET ${offset}`
            );
            const countRes = await pool.query(
                `SELECT COUNT(*) FROM ${format('%I', tableName)} WHERE ${conditions}`
            );
            rows = rowRes.rows;
            totalCount = parseInt(countRes.rows[0].count);
        } else {
            const rowRes = await pool.query(
                `SELECT * FROM ${format('%I', tableName)} ORDER BY _id LIMIT ${limit} OFFSET ${offset}`
            );
            const countRes = await pool.query(`SELECT COUNT(*) FROM ${format('%I', tableName)}`);
            rows = rowRes.rows;
            totalCount = parseInt(countRes.rows[0].count);
        }

        // Get column names (minus _id) for the table header
        const colRes = await pool.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = $1 AND column_name != '_id' ORDER BY ordinal_position`,
            [tableName]
        );
        const columns = colRes.rows.map(r => r.column_name);

        return res.json({ rows, columns, page, limit, totalCount });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/data/:id/rows — insert a new row
// Body: { values: { col1: "val1", col2: "val2", ... } }
// ─────────────────────────────────────────────────────────────────
export const addDatasetRow = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { values } = req.body;

    if (!values || typeof values !== "object") {
        return res.status(400).json({ message: "Row values are required." });
    }

    try {
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (meta.rows.length === 0) return res.status(404).json({ message: "Dataset not found." });

        const tableName = meta.rows[0].storage_table_name;
        const cols = Object.keys(values);
        const vals = Object.values(values);

        const insertQuery = format(`INSERT INTO %I (%I) VALUES (%L) RETURNING *`, tableName, cols, vals);
        const result = await pool.query(insertQuery);

        // Update row_count
        await pool.query(`UPDATE datasets SET row_count = row_count + 1, updated_at = NOW() WHERE id = $1`, [id]);

        return res.status(201).json({ row: result.rows[0] });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/data/:id/rows/:rowId — update a single row by _id
// Body: { values: { col1: "val1", ... } }
// ─────────────────────────────────────────────────────────────────
export const updateDatasetRow = async (req, res, next) => {
    const { id, rowId } = req.params;
    const { organizationId } = req.user;
    const { values } = req.body;

    if (!values || typeof values !== "object" || Object.keys(values).length === 0) {
        return res.status(400).json({ message: "Updated values are required." });
    }

    try {
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (meta.rows.length === 0) return res.status(404).json({ message: "Dataset not found." });

        const tableName = meta.rows[0].storage_table_name;
        // Build: SET col1 = 'v1', col2 = 'v2'
        const setClauses = Object.entries(values)
            .map(([col, val]) => format("%I = %L", col, val))
            .join(", ");

        const updateQuery = `UPDATE ${format('%I', tableName)} SET ${setClauses} WHERE _id = ${parseInt(rowId)} RETURNING *`;
        const result = await pool.query(updateQuery);

        if (result.rows.length === 0) return res.status(404).json({ message: "Row not found." });
        return res.json({ row: result.rows[0] });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/data/:id/rows/:rowId — delete a row by _id
// ─────────────────────────────────────────────────────────────────
export const deleteDatasetRow = async (req, res, next) => {
    const { id, rowId } = req.params;
    const { organizationId } = req.user;

    try {
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (meta.rows.length === 0) return res.status(404).json({ message: "Dataset not found." });

        const tableName = meta.rows[0].storage_table_name;
        const result = await pool.query(
            `DELETE FROM ${format('%I', tableName)} WHERE _id = $1 RETURNING _id`,
            [parseInt(rowId)]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Row not found." });

        // Update row_count
        await pool.query(`UPDATE datasets SET row_count = GREATEST(row_count - 1, 0), updated_at = NOW() WHERE id = $1`, [id]);

        return res.json({ success: true, deleted_id: result.rows[0]._id });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/data/:id/analysis — fetch stored LLM analysis for a dataset
// ─────────────────────────────────────────────────────────────────
export const getDatasetAnalysis = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    try {
        const result = await pool.query(`
            SELECT d.id, d.name, d.created_at, dm.metadata->'llm_analysis' AS llm_analysis
            FROM datasets d
            JOIN dataset_metadata dm ON dm.dataset_id = d.id
            WHERE d.id = $1 AND d.organization_id = $2
        `, [id, organizationId]);

        if (result.rows.length === 0 || !result.rows[0].llm_analysis) {
            return res.status(404).json({ message: "No analysis found for this dataset. Please run an analysis first." });
        }

        const { name, created_at, llm_analysis } = result.rows[0];
        return res.json({ id, name, created_at, analysis: llm_analysis });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/data/analyzed — list all datasets that have an LLM analysis
// ─────────────────────────────────────────────────────────────────
export const listAnalyzedDatasets = async (req, res, next) => {
    const { organizationId } = req.user;
    const { search } = req.query;
    try {
        let queryStr = `
            SELECT d.id, d.name, d.row_count, d.column_count, d.created_at,
                   d.updated_at,
                   (dm.metadata->'llm_analysis') IS NOT NULL AS has_analysis,
                   dm.metadata->>'thumbnail' AS thumbnail
            FROM datasets d
            LEFT JOIN dataset_metadata dm ON dm.dataset_id = d.id
            WHERE d.organization_id = $1
              AND (dm.metadata->'llm_analysis') IS NOT NULL
        `;
        const queryParams = [organizationId];

        if (search) {
            queryParams.push(`%${search}%`);
            queryStr += ` AND d.name ILIKE $2`;
        }

        queryStr += ` ORDER BY d.updated_at DESC NULLS LAST`;

        const result = await pool.query(queryStr, queryParams);

        return res.json({ dashboards: result.rows });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /api/data/:id/thumbnail — save an auto-captured PNG thumbnail
// Body: { thumbnail: "data:image/png;base64,..." }
// ─────────────────────────────────────────────────────────────────
export const saveDatasetThumbnail = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { thumbnail } = req.body;

    if (!thumbnail || !thumbnail.startsWith('data:image')) {
        return res.status(400).json({ message: 'A valid base64 image is required.' });
    }

    try {
        // Verify the dataset belongs to this org
        const check = await pool.query(
            `SELECT id FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Dataset not found.' });

        await pool.query(`
            UPDATE dataset_metadata
            SET metadata = metadata || jsonb_build_object('thumbnail', $1::text)
            WHERE dataset_id = $2
        `, [thumbnail, id]);

        return res.json({ success: true });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/data/:id — permanently delete a dataset + metadata + storage table
// ─────────────────────────────────────────────────────────────────
export const deleteDataset = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    try {
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (meta.rows.length === 0) return res.status(404).json({ message: 'Dataset not found.' });
        const tableName = meta.rows[0].storage_table_name;

        await pool.query('BEGIN');
        try {
            if (tableName) await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
            await pool.query(`DELETE FROM dataset_metadata WHERE dataset_id = $1`, [id]);
            await pool.query(`DELETE FROM datasets WHERE id = $1`, [id]);
            await pool.query('COMMIT');
        } catch (txErr) {
            await pool.query('ROLLBACK');
            throw txErr;
        }
        return res.json({ success: true });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/data/:id/insight-query — run LLM-generated read-only SQL
// Body: { sql_query: "SELECT ... FROM {{table_name}} ..." }
// ─────────────────────────────────────────────────────────────────
export const runInsightQuery = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { sql_query } = req.body;

    if (!sql_query) return res.status(400).json({ message: 'sql_query is required.' });

    // Safety: only allow SELECT statements. Check the first keyword only,
    // not the full body — column names/string literals can contain blocked words.
    const firstToken = sql_query.trim().split(/\s+/)[0].toUpperCase();
    if (firstToken !== 'SELECT') {
        return res.status(400).json({ message: 'Only read-only SELECT queries are allowed.' });
    }

    try {
        // Look up the real storage table for this dataset
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (meta.rows.length === 0) return res.status(404).json({ message: 'Dataset not found.' });

        const tableName = meta.rows[0].storage_table_name;

        // Substitute the placeholder or forcefully replace generic table names
        let safeSql = sql_query;
        if (safeSql.includes('{{table_name}}')) {
            safeSql = safeSql.replace(/\{\{table_name\}\}/gi, `"${tableName}"`);
        } else {
            safeSql = safeSql.replace(/\bFROM\s+["']?[a-zA-Z0-9_]+["']?/gi, `FROM "${tableName}"`);
        }

        // Enforce a hard LIMIT 20
        safeSql = safeSql.replace(/\bLIMIT\s+\d+\b/gi, '').trim().replace(/;$/, '') + ' LIMIT 20';

        const result = await pool.query(safeSql);
        return res.json({ rows: result.rows, columns: result.fields.map(f => f.name) });
    } catch (err) {
        return res.status(400).json({ message: `Query failed: ${err.message}` });
    }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/data/:id/chat — natural language → SQL → result
// Body: { question: "How many Meteor 350 bikes were sold in Feb?" }
// ─────────────────────────────────────────────────────────────────
export const chatWithDataset = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { question } = req.body;

    if (!question || !question.trim()) {
        return res.status(400).json({ message: 'question is required.' });
    }

    try {
        // 1. Fetch dataset info + metadata
        const datasetRes = await pool.query(
            `SELECT d.name, d.storage_table_name, dm.metadata
             FROM datasets d
             LEFT JOIN dataset_metadata dm ON dm.dataset_id = d.id
             WHERE d.id = $1 AND d.organization_id = $2`,
            [id, organizationId]
        );
        if (datasetRes.rows.length === 0) {
            return res.status(404).json({ message: 'Dataset not found.' });
        }
        const { name, storage_table_name, metadata } = datasetRes.rows[0];

        // 2. Build a typed column schema for the LLM
        const cols = metadata?.columns || [];
        const columnSchema = cols.map(col => {
            if (col.type === 'numeric') {
                return `  - "${col.name}" [NUMERIC, stored as TEXT — CAST("${col.name}" AS NUMERIC). min=${col.min}, max=${col.max}, avg=${col.avg}]`;
            } else if (col.type === 'date') {
                return `  - "${col.name}" [DATE, stored as TEXT — use CAST("${col.name}" AS DATE) for comparisons]`;
            } else {
                const samples = (col.unique_values || col.sample || []).slice(0, 6).map(v => `'${v}'`).join(', ');
                return `  - "${col.name}" [TEXT, ${col.unique_count ?? ''} unique values. Samples: ${samples}]`;
            }
        }).join('\n');

        // 3. Call Ollama to convert the question to SQL
        const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
        const systemPrompt = `You are a SQL expert assistant. Translate the user's plain-English question into a PostgreSQL SELECT query.
        DATASET: "${name}"
        TABLE: "${storage_table_name}"
        COLUMNS:
        ${columnSchema}

        RULES:
        - Use ONLY the exact column names listed above (already lowercase).
        - ALL columns are stored as TEXT — always CAST for numeric/date ops.
        - Use the literal table name "${storage_table_name}".
        - Only generate SELECT queries — never INSERT/UPDATE/DELETE/DROP.
        - Use ILIKE '%text%' for case-insensitive partial text matching. Never use exact = for text fields.
        - NEVER select the internal "_id" column.
        - If you use an aggregate function (SUM, COUNT, MAX), any non-aggregated column MUST be in a GROUP BY clause.
- Return ONLY a JSON object with two fields: "description" and "sql_query".
- "description": A natural language sentence answering the question. IMPORTANT: wherever you would put a computed value (a count, sum, avg, name, etc.), instead write the SQL column alias in double curly braces, e.g. "{{count}}" or "{{total_revenue}}". Example: "Rakesh sold {{count}} bikes in February."
- "sql_query": a valid runnable PostgreSQL SELECT query. Give each computed column a clear alias (e.g. SELECT COUNT(*) AS count).
RESPOND IN PURE JSON ONLY — no markdown, no explanation outside the JSON.`;

        const llmRes = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || 'llama3',
                prompt: `User question: ${question}`,
                system: systemPrompt,
                stream: false,
                format: 'json'
            })
        });
        if (!llmRes.ok) throw new Error(`Ollama returned ${llmRes.status}`);
        const llmData = await llmRes.json();

        let parsed;
        try { parsed = JSON.parse(llmData.response); }
        catch { return res.status(500).json({ message: 'LLM returned invalid JSON.', raw: llmData.response }); }

        let { description, sql_query } = parsed;

        // 4. Safety check — only allow SELECT
        const firstToken = (sql_query || '').trim().split(/\s+/)[0].toUpperCase();
        if (!sql_query || firstToken !== 'SELECT') {
            return res.json({ description, sql_query, rows: [], columns: [], warning: 'No runnable SQL generated.' });
        }

        // 5. Clean + run the SQL
        let safeSql = sql_query.replace(/`/g, '"');
        safeSql = safeSql.replace(/["']?\{\{table_name\}\}["']?/gi, `"${storage_table_name}"`);
        safeSql = safeSql.replace(new RegExp(`["']?\\b${storage_table_name}\\b["']?`, 'g'), `"${storage_table_name}"`);
        safeSql = safeSql.replace(/\bLIMIT\s+\d+\b/gi, '').trim().replace(/;$/, '') + ' LIMIT 50';

        console.log(`[Chat SQL] ${safeSql}`);
        const queryResult = await pool.query(safeSql);

        // 6. Inject actual SQL result values into the {{placeholders}} in the description
        if (queryResult.rows.length > 0) {
            const firstRow = queryResult.rows[0];
            description = description.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, colName) => {
                const key = colName.trim();
                if (firstRow[key] !== undefined && firstRow[key] !== null) {
                    const val = firstRow[key];
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal) && numVal % 1 !== 0) return numVal.toFixed(2);
                    return val;
                }
                return match; // leave untouched if column not in result
            });
        }

        // Fallback: if query returned 0 rows or LLM used a mismatched alias, safely replace remaining placeholders with 0
        description = description.replace(/\{\{[^}]+\}\}/gi, '0');

        return res.json({
            description,
            sql_query,
            rows: queryResult.rows,
            columns: queryResult.fields.map(f => f.name)
        });
    } catch (err) {
        console.error("[Chat Error]", err);
        return res.status(500).json({ message: err.message || "Internal server error" });
    }
};
