import pool from "../config/db.js";
import format from "pg-format";

const isShowroomScopedUser = (user) => ["manager", "analyst"].includes(user?.role);

const getDatasetScope = (user, { alias = "", paramOffset = 0 } = {}) => {
    const prefix = alias ? `${alias}.` : "";
    const conditions = [`${prefix}organization_id = $${paramOffset + 1}`];
    const params = [user.organizationId];

    if (isShowroomScopedUser(user)) {
        if (!user.showroomId) {
            conditions.push("1 = 0");
        } else {
            params.push(user.showroomId);
            conditions.push(`${prefix}showroom_id = $${paramOffset + params.length}`);
        }
    }

    return { conditions, params };
};

// ─────────────────────────────────────────────────────────────────
// GET /api/data/datasets — list all datasets for an org
// ─────────────────────────────────────────────────────────────────
export const listDatasets = async (req, res, next) => {
    try {
        const scope = getDatasetScope(req.user);
        const result = await pool.query(
            `SELECT id, name, storage_table_name, row_count, column_count, created_at
             FROM datasets WHERE ${scope.conditions.join(" AND ")} ORDER BY created_at DESC`,
            scope.params
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
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
    const { values } = req.body;

    if (!values || typeof values !== "object") {
        return res.status(400).json({ message: "Row values are required." });
    }

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
    const { values } = req.body;

    if (!values || typeof values !== "object" || Object.keys(values).length === 0) {
        return res.status(400).json({ message: "Updated values are required." });
    }

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
    try {
        const scope = getDatasetScope(req.user, { alias: "d", paramOffset: 1 });
        const result = await pool.query(`
            SELECT d.id, d.name, d.created_at, dm.metadata->'llm_analysis' AS llm_analysis
            FROM datasets d
            JOIN dataset_metadata dm ON dm.dataset_id = d.id
            WHERE d.id = $1 AND ${scope.conditions.join(" AND ")}
        `, [id, ...scope.params]);

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
    const { search, showroom_id } = req.query;
    try {
        const scope = getDatasetScope(req.user, { alias: "d" });
        let queryStr = `
            SELECT d.id, d.name, d.row_count, d.column_count, d.created_at,
                   d.updated_at,
                   (dm.metadata->'llm_analysis') IS NOT NULL AS has_analysis,
                   dm.metadata->>'thumbnail' AS thumbnail
            FROM datasets d
            LEFT JOIN dataset_metadata dm ON dm.dataset_id = d.id
            WHERE ${scope.conditions.join(" AND ")}
              AND (dm.metadata->'llm_analysis') IS NOT NULL
        `;
        const queryParams = [...scope.params];

        if (!isShowroomScopedUser(req.user) && showroom_id) {
            queryParams.push(showroom_id);
            queryStr += ` AND d.showroom_id = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            queryStr += ` AND d.name ILIKE $${queryParams.length}`;
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
    const { thumbnail } = req.body;

    if (!thumbnail || !thumbnail.startsWith('data:image')) {
        return res.status(400).json({ message: 'A valid base64 image is required.' });
    }

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        // Verify the dataset belongs to this org
        const check = await pool.query(
            `SELECT id FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
// PATCH /api/data/:id/layout — save dashboard layout (viewMode + order arrays)
// ─────────────────────────────────────────────────────────────────
export const saveLayout = async (req, res, next) => {
    const { id } = req.params;
    const { viewMode, chartOrder, insightOrder } = req.body;

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        const check = await pool.query(
            `SELECT id FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Dataset not found.' });

        const layout = { viewMode, chartOrder, insightOrder };
        await pool.query(`
            UPDATE dataset_metadata
            SET metadata = metadata || jsonb_build_object('dashboard_layout', $1::jsonb)
            WHERE dataset_id = $2
        `, [JSON.stringify(layout), id]);

        return res.json({ success: true });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/data/:id/layout — retrieve saved dashboard layout
// ─────────────────────────────────────────────────────────────────
export const getLayout = async (req, res, next) => {
    const { id } = req.params;

    try {
        const scope = getDatasetScope(req.user, { alias: "d", paramOffset: 1 });
        const result = await pool.query(
            `SELECT dm.metadata->'dashboard_layout' AS layout
             FROM dataset_metadata dm
             JOIN datasets d ON d.id = dm.dataset_id
             WHERE dm.dataset_id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Dataset not found.' });

        return res.json({ layout: result.rows[0].layout || null });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/data/:id/edit-item — use LLM to edit a single chart or insight
// Body: { type: 'chart'|'insight', index: number, instruction: string }
// ─────────────────────────────────────────────────────────────────
export const editDashboardItem = async (req, res, next) => {
    const { id } = req.params;
    const { type, index, instruction } = req.body;

    if (!type || index === undefined || !instruction?.trim()) {
        return res.status(400).json({ message: 'type, index, and instruction are required.' });
    }

    try {
        const scope = getDatasetScope(req.user, { alias: "d", paramOffset: 1 });
        const result = await pool.query(`
            SELECT d.name, dm.metadata
            FROM datasets d
            JOIN dataset_metadata dm ON d.id = dm.dataset_id
            WHERE d.id = $1 AND ${scope.conditions.join(" AND ")}
        `, [id, ...scope.params]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Dataset not found.' });

        const { name, metadata } = result.rows[0];
        const analysis = metadata.llm_analysis;

        if (!analysis) return res.status(400).json({ message: 'No analysis found. Analyze the dataset first.' });

        const columnSummary = (metadata.columns || []).map(col => {
            if (col.type === 'numeric') return `${col.name} (number)`;
            if (col.type === 'date') return `${col.name} (date)`;
            return `${col.name} (text)`;
        }).join(', ');

        let systemPrompt, userPrompt;

        if (type === 'chart') {
            const currentChart = analysis.charts?.[index];
            if (!currentChart) return res.status(400).json({ message: `Chart at index ${index} not found.` });

            systemPrompt = `You are a data analyst. Update a chart config based on the user's instruction.
Available columns: ${columnSummary}
Choose the most appropriate chart for the dataset and selected columns. Prefer the clearest chart, not the fanciest one.
Only use chart types supported by our dashboard renderer:
- bar: compare values across categories
- line: show trends over time or ordered sequences
- area: show trends over time with magnitude emphasis
- pie: show part-to-whole breakdowns with a small number of categories
- scatter: show correlation between two numeric variables
- radar: compare multivariate profiles across a small number of categories
- composed: combine bar and line style comparisons when both views help
- radialBar: show compact ranked or part-to-whole comparisons for a few categories
- treemap: show many-category part-to-whole composition
Use line or area when the x-axis is a date or ordered progression. Use bar by default for category comparison. Use scatter only when both axes are numeric. Use pie or radialBar only when composition is the main story and category count is low. Avoid complex charts when bar, line, or area would explain the data better.
Return ONLY a JSON object: {"chart_type":"...","title":"...","x_axis_column":"...","y_axis_column":"...","description":"..."}`;

            userPrompt = `Current chart: ${JSON.stringify(currentChart)}\n\nUser instruction: "${instruction.trim()}"`;

        } else if (type === 'insight') {
            const currentInsight = analysis.insights?.[index];
            if (!currentInsight) return res.status(400).json({ message: `Insight at index ${index} not found.` });

            const currentText = typeof currentInsight === 'string' ? currentInsight : currentInsight.description;

            systemPrompt = `You are a data analyst for dataset "${name}".
Available columns: ${columnSummary}
Return ONLY a JSON object: {"type":"Insight","description":"A specific concrete fact about the data."}`;

            userPrompt = `Current insight: "${currentText}"\n\nUser instruction: "${instruction.trim()}"`;

        } else {
            return res.status(400).json({ message: 'type must be "chart" or "insight".' });
        }

        const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
        let llmRes;
        try {
            llmRes = await fetch(`${OLLAMA_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'llama3',
                    prompt: userPrompt,
                    system: systemPrompt,
                    stream: false,
                    format: 'json',
                    keep_alive: '15m',
                    options: { num_ctx: 4096, num_predict: 300, temperature: 0.2 }
                })
            });
        } catch (fetchErr) {
            throw new Error(`Failed to connect to Ollama: ${fetchErr.message}`);
        }

        if (!llmRes.ok) throw new Error(`Ollama returned ${llmRes.status}`);

        const llmData = await llmRes.json();
        let updated;
        try { updated = JSON.parse(llmData.response); }
        catch { return res.status(500).json({ message: 'LLM returned invalid JSON.', raw: llmData.response }); }

        // Merge updated item into the full analysis
        const newAnalysis = { ...analysis };
        if (type === 'chart') {
            newAnalysis.charts = [...analysis.charts];
            newAnalysis.charts[index] = { ...analysis.charts[index], ...updated };
        } else {
            newAnalysis.insights = [...analysis.insights];
            newAnalysis.insights[index] = { ...analysis.insights[index], ...updated };
        }

        // Persist the updated analysis to the DB
        await pool.query(`
            UPDATE dataset_metadata
            SET metadata = metadata || jsonb_build_object('llm_analysis', $1::jsonb)
            WHERE dataset_id = $2
        `, [JSON.stringify(newAnalysis), id]);

        return res.json({ success: true, updated, analysis: newAnalysis });

    } catch (err) {
        if (err.message?.includes('ECONNREFUSED') || err.message?.includes('11434')) {
            return res.status(503).json({ message: 'Ollama is not running. Please ensure Ollama is accessible on port 11434.' });
        }
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/data/:id — permanently delete a dataset + metadata + storage table
// ─────────────────────────────────────────────────────────────────
export const deleteDataset = async (req, res, next) => {
    const { id } = req.params;
    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
    const { sql_query } = req.body;

    if (!sql_query) return res.status(400).json({ message: 'sql_query is required.' });

    // Safety: only allow SELECT statements. Check the first keyword only,
    // not the full body — column names/string literals can contain blocked words.
    const firstToken = sql_query.trim().split(/\s+/)[0].toUpperCase();
    if (firstToken !== 'SELECT') {
        return res.status(400).json({ message: 'Only read-only SELECT queries are allowed.' });
    }

    try {
        const scope = getDatasetScope(req.user, { paramOffset: 1 });
        // Look up the real storage table for this dataset
        const meta = await pool.query(
            `SELECT storage_table_name FROM datasets WHERE id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
    const { question } = req.body;

    if (!question || !question.trim()) {
        return res.status(400).json({ message: 'question is required.' });
    }

    try {
        const scope = getDatasetScope(req.user, { alias: "d", paramOffset: 1 });
        // 1. Fetch dataset info + metadata
        const datasetRes = await pool.query(
            `SELECT d.name, d.storage_table_name, dm.metadata
             FROM datasets d
             LEFT JOIN dataset_metadata dm ON dm.dataset_id = d.id
             WHERE d.id = $1 AND ${scope.conditions.join(" AND ")}`,
            [id, ...scope.params]
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
        const systemPrompt = `You are a PostgreSQL expert. Convert the user's English question into one valid PostgreSQL SELECT query.

DATASET: "${name}"
TABLE: "${storage_table_name}"
COLUMNS (all stored as TEXT in PostgreSQL):
${columnSchema}

RULES:
1. Use ONLY the exact column names listed above. Never invent column names.
2. Every column is TEXT. Always CAST for math or date operations:
   - Numbers: CAST("col" AS NUMERIC)
   - Dates: CAST("col" AS DATE)
   - In WHERE too: WHERE CAST("price" AS NUMERIC) > 500
3. Text matching: use ILIKE for filters (e.g. WHERE region ILIKE 'North'). Never use = for user-supplied text values.
4. Multiple conditions: use AND / OR as needed (e.g. WHERE region ILIKE 'North' AND CAST("year" AS NUMERIC) = 2023).
5. Never reference the "_id" column. Only generate SELECT statements.
6. Aggregates (SUM/COUNT/AVG/MAX/MIN): every non-aggregated SELECT column must be in GROUP BY.
7. Every computed value needs an AS alias: COUNT(*) AS total_rows, SUM(...) AS total_units.
8. COUNT(*) vs SUM: 
   - COUNT(*) = counts rows/transactions → use for "how many records / orders / entries"
   - SUM("col") = adds up values in a column → use for "how many units sold / total revenue / total quantity"
9. Top / most / best / highest → ORDER BY alias DESC LIMIT 1
   Lowest / worst / least / minimum → ORDER BY alias ASC LIMIT 1
   Top N / list → ORDER BY alias DESC LIMIT N (default 10 if unspecified)
10. "Show / list / find / display" without aggregation → SELECT * ... LIMIT 20
11. Distinct count: "how many unique X" → COUNT(DISTINCT "col") AS unique_count
12. Every {{placeholder}} in description MUST exactly match an AS alias in sql_query.

OUTPUT — respond with ONLY this JSON, no markdown:
{"description": "One sentence answering the question with {{alias}} for computed values.", "sql_query": "Complete PostgreSQL SELECT query."}

EXAMPLES:

Q: Show all sales from the West region
{"description":"Here are the sales records from the West region.","sql_query":"SELECT * FROM \\"${storage_table_name}\\" WHERE region ILIKE 'West' LIMIT 20"}

Q: How many total units were sold in the North region?
{"description":"{{total_units}} units were sold in the North region.","sql_query":"SELECT SUM(CAST(units_sold AS NUMERIC)) AS total_units FROM \\"${storage_table_name}\\" WHERE region ILIKE 'North'"}

Q: How many orders were placed?
{"description":"There are {{total_rows}} orders in total.","sql_query":"SELECT COUNT(*) AS total_rows FROM \\"${storage_table_name}\\""}

Q: Which salesperson sold the most units?
{"description":"{{salesperson}} sold the most units with {{total_units}} units.","sql_query":"SELECT salesperson, SUM(CAST(units_sold AS NUMERIC)) AS total_units FROM \\"${storage_table_name}\\" GROUP BY salesperson ORDER BY total_units DESC LIMIT 1"}

Q: What is the total revenue by region?
{"description":"Here is the total revenue broken down by region.","sql_query":"SELECT region, ROUND(SUM(CAST(revenue AS NUMERIC)), 2) AS total_revenue FROM \\"${storage_table_name}\\" GROUP BY region ORDER BY total_revenue DESC"}

Q: What is the average selling price?
{"description":"The average selling price is {{avg_price}}.","sql_query":"SELECT ROUND(AVG(CAST(price AS NUMERIC)), 2) AS avg_price FROM \\"${storage_table_name}\\""}

Q: Show sales where price is greater than 500
{"description":"Here are the sales where price exceeds 500.","sql_query":"SELECT * FROM \\"${storage_table_name}\\" WHERE CAST(price AS NUMERIC) > 500 LIMIT 20"}

Q: How many unique products are there?
{"description":"There are {{unique_count}} unique products in the dataset.","sql_query":"SELECT COUNT(DISTINCT product) AS unique_count FROM \\"${storage_table_name}\\""}

Q: Top 5 regions by total units sold
{"description":"Here are the top 5 regions by total units sold.","sql_query":"SELECT region, SUM(CAST(units_sold AS NUMERIC)) AS total_units FROM \\"${storage_table_name}\\" GROUP BY region ORDER BY total_units DESC LIMIT 5"}

Q: Show sales from the North region in 2023
{"description":"Here are the sales from the North region in 2023.","sql_query":"SELECT * FROM \\"${storage_table_name}\\" WHERE region ILIKE 'North' AND CAST(date AS DATE) >= '2023-01-01' AND CAST(date AS DATE) <= '2023-12-31' LIMIT 20"}
`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout

        let llmRes;
        try {
            llmRes = await fetch(`${OLLAMA_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'llama3',
                    prompt: `User question: ${question}`,
                    system: systemPrompt,
                    stream: false,
                    format: 'json',
                    keep_alive: '15m',     // keep model loaded between chat messages
                    options: {
                        num_predict: 600,  // chat only needs description + one SQL query
                        temperature: 0.1   // deterministic output = more reliable SQL
                    }
                }),
                signal: controller.signal
            });
        } catch (fetchErr) {
            if (fetchErr.name === 'AbortError') {
                throw new Error("Ollama request timed out after 3 minutes. This usually happens if the model is slow or system resources are high.");
            }
            throw new Error(`Failed to connect to Ollama: ${fetchErr.message}`);
        } finally {
            clearTimeout(timeoutId);
        }

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

            // Build normalized alias map (lowercase, underscores) for fuzzy matching
            const aliasMap = {};
            for (const [key, val] of Object.entries(firstRow)) {
                const normKey = key.toLowerCase().replace(/\s+/g, '_');
                let displayVal;
                if (val === null || val === undefined || val === '') {
                    displayVal = null;
                } else {
                    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
                    if (!isNaN(num)) {
                        displayVal = Number.isInteger(num) || !String(val).includes('.')
                            ? num.toLocaleString('en-IN')
                            : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    } else {
                        displayVal = String(val);
                    }
                }
                aliasMap[normKey] = displayVal;
            }

            description = description.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawKey) => {
                const normKey = rawKey.trim().toLowerCase().replace(/\s+/g, '_');
                const resolved = aliasMap[normKey];
                if (resolved === null || resolved === undefined) return '';
                return resolved;
            });
        }

        // Fallback: strip any remaining {{placeholders}} cleanly without leaving "[N/A]" mid-sentence
        description = description
            .replace(/\s*\{\{[^}]+\}\}/gi, '')
            .replace(/\{\{[^}]+\}\}\s*/gi, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/\s([.,])/g, '$1')
            .trim();

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
