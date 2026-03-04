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
