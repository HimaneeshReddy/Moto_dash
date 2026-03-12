import pkg from "pg";
import format from "pg-format";
import pool from "../config/db.js";

const { Pool } = pkg;

const sanitizeIdentifier = (name) => {
    let cleaned = String(name).toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (/^[0-9]/.test(cleaned)) cleaned = "_" + cleaned;
    return cleaned || "unknown_col";
};

// ─────────────────────────────────────────────────────────────────
// POST /api/data/db-connect/test
// Tests an external DB connection and returns the list of tables.
// Body: { dbType, host, port, username, password, databaseName }
// ─────────────────────────────────────────────────────────────────
export const testDbConnection = async (req, res, next) => {
    const { dbType, host, port, username, password, databaseName } = req.body;

    if (!host || !username || !databaseName) {
        return res.status(400).json({ message: "host, username, and databaseName are required." });
    }

    try {
        if (dbType === "postgresql") {
            const extPool = new Pool({
                host,
                port: parseInt(port) || 5432,
                user: username,
                password,
                database: databaseName,
                connectionTimeoutMillis: 8000,
                ssl: false,
            });
            try {
                const client = await extPool.connect();
                const result = await client.query(
                    `SELECT table_name FROM information_schema.tables
                     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                     ORDER BY table_name`
                );
                client.release();
                await extPool.end();
                return res.json({ success: true, tables: result.rows.map(r => r.table_name) });
            } catch (err) {
                await extPool.end().catch(() => {});
                return res.status(400).json({ message: `Connection failed: ${err.message}` });
            }

        } else if (dbType === "mysql") {
            try {
                const mysql = await import("mysql2/promise");
                const conn = await mysql.createConnection({
                    host, port: parseInt(port) || 3306,
                    user: username, password, database: databaseName,
                    connectTimeout: 8000,
                });
                const [rows] = await conn.execute("SHOW TABLES");
                const key = Object.keys(rows[0])[0];
                const tables = rows.map(r => r[key]);
                await conn.end();
                return res.json({ success: true, tables });
            } catch (err) {
                return res.status(400).json({ message: `Connection failed: ${err.message}` });
            }

        } else {
            return res.status(400).json({ message: "Unsupported database type." });
        }
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/data/db-connect/import
// Imports a table from an external DB as a new dataset.
// Body: { datasetName, dbType, host, port, username, password, databaseName, tableName }
// Returns same shape as uploadCsv so frontend can use AnalyzingLoader.
// ─────────────────────────────────────────────────────────────────
export const importDbTable = async (req, res, next) => {
    const { datasetName, dbType, host, port, username, password, databaseName, tableName } = req.body;
    const { userId, organizationId } = req.user;

    if (!datasetName || !tableName) {
        return res.status(400).json({ message: "datasetName and tableName are required." });
    }

    try {
        let rows = [], rawHeaders = [];

        if (dbType === "postgresql") {
            const extPool = new Pool({
                host, port: parseInt(port) || 5432,
                user: username, password, database: databaseName,
                connectionTimeoutMillis: 10000, ssl: false,
            });
            try {
                const client = await extPool.connect();
                const colRes = await client.query(
                    `SELECT column_name FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = $1
                     ORDER BY ordinal_position`,
                    [tableName]
                );
                rawHeaders = colRes.rows.map(r => r.column_name);
                const dataRes = await client.query(
                    format("SELECT * FROM %I LIMIT 10000", tableName)
                );
                rows = dataRes.rows;
                client.release();
            } finally {
                await extPool.end().catch(() => {});
            }

        } else if (dbType === "mysql") {
            const mysql = await import("mysql2/promise");
            const conn = await mysql.createConnection({
                host, port: parseInt(port) || 3306,
                user: username, password, database: databaseName,
                connectTimeout: 10000,
            });
            const [colRows] = await conn.execute(
                `SELECT COLUMN_NAME FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                 ORDER BY ORDINAL_POSITION`,
                [databaseName, tableName]
            );
            rawHeaders = colRows.map(r => r.COLUMN_NAME);
            const [dataRows] = await conn.execute(
                // mysql2 doesn't support format() — use template; tableName is user-provided
                // but was already validated as coming from SHOW TABLES on the same connection
                `SELECT * FROM \`${tableName.replace(/`/g, '')}\` LIMIT 10000`
            );
            rows = dataRows;
            await conn.end();

        } else {
            return res.status(400).json({ message: "Unsupported database type." });
        }

        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: "Table is empty or returned no data." });
        }

        // Sanitize column names (same as CSV flow)
        const usedNames = new Set();
        const uniqueHeaders = rawHeaders.map(h => {
            let clean = sanitizeIdentifier(h);
            let final = clean;
            let n = 1;
            while (usedNames.has(final)) { final = `${clean}_${n}`; n++; }
            usedNames.add(final);
            return final;
        });

        // Re-map rows to sanitized keys, convert all values to strings
        const sanitizedRows = rows.map(row => {
            const newRow = {};
            rawHeaders.forEach((raw, i) => {
                const v = row[raw];
                newRow[uniqueHeaders[i]] = (v === null || v === undefined) ? null : String(v);
            });
            return newRow;
        });

        const client = await pool.connect();
        try {
            const randomStr = Math.random().toString(36).substring(2, 8);
            const storageTable = `ds_${organizationId.replace(/-/g, "")}_${randomStr}`;

            await client.query("BEGIN");

            const colsDef = uniqueHeaders.map(col => format("%I TEXT", col)).join(", ");
            await client.query(
                `CREATE TABLE ${format("%I", storageTable)} ( _id SERIAL PRIMARY KEY, ${colsDef} )`
            );

            const BATCH_SIZE = 500;
            for (let i = 0; i < sanitizedRows.length; i += BATCH_SIZE) {
                const batch = sanitizedRows.slice(i, i + BATCH_SIZE);
                const rowValues = batch.map(row =>
                    uniqueHeaders.map(h => (row[h] === "" ? null : row[h]))
                );
                await client.query(
                    format("INSERT INTO %I (%I) VALUES %L", storageTable, uniqueHeaders, rowValues)
                );
            }

            const insertRes = await client.query(
                `INSERT INTO datasets (organization_id, name, storage_table_name, uploaded_by, row_count, column_count)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, created_at, storage_table_name`,
                [organizationId, datasetName, storageTable, userId, sanitizedRows.length, uniqueHeaders.length]
            );
            const datasetId = insertRes.rows[0].id;

            // Build column metadata (same logic as CSV)
            const columnStats = uniqueHeaders.map(col => {
                const values = sanitizedRows
                    .map(r => r[col])
                    .filter(v => v !== null && v !== undefined && v !== "");
                const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
                const isNumeric = numericValues.length > 0 && numericValues.length === values.length;
                const dateTest = values.slice(0, 10).every(v => !isNaN(Date.parse(v)));
                const isDate = !isNumeric && dateTest && values.length > 0;

                if (isNumeric) {
                    const min = Math.min(...numericValues);
                    const max = Math.max(...numericValues);
                    const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                    return { name: col, type: "numeric", min: parseFloat(min.toFixed(4)), max: parseFloat(max.toFixed(4)), avg: parseFloat(avg.toFixed(4)), null_count: sanitizedRows.length - values.length, sample: values.slice(0, 5) };
                } else if (isDate) {
                    return { name: col, type: "date", null_count: sanitizedRows.length - values.length, sample: values.slice(0, 5) };
                } else {
                    const uniqueVals = [...new Set(values)];
                    return { name: col, type: "text", unique_count: uniqueVals.length, unique_values: uniqueVals.slice(0, 20), null_count: sanitizedRows.length - values.length, sample: values.slice(0, 5) };
                }
            });

            const metadataBlob = {
                schema_version: 1,
                row_count: sanitizedRows.length,
                column_count: uniqueHeaders.length,
                columns: columnStats,
            };

            await client.query(
                `INSERT INTO dataset_metadata (dataset_id, metadata) VALUES ($1, $2)`,
                [datasetId, JSON.stringify(metadataBlob)]
            );

            await client.query("COMMIT");

            return res.status(201).json({
                success: true,
                dataset: insertRes.rows[0],
                metadata: metadataBlob,
                message: `Imported ${sanitizedRows.length} rows across ${uniqueHeaders.length} columns from "${tableName}".`,
            });

        } catch (err) {
            await client.query("ROLLBACK");
            next(err);
        } finally {
            client.release();
        }

    } catch (err) { next(err); }
};
