import fs from "fs";
import csvParser from "csv-parser";
import format from "pg-format";
import pool from "../config/db.js";

// Utility to clean column names for PostgreSQL
const sanitizeIdentifier = (name) => {
    let cleaned = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    // If it starts with a number, prepend an underscore
    if (/^[0-9]/.test(cleaned)) {
        cleaned = "_" + cleaned;
    }
    // Prevent empty column names
    return cleaned || "unknown_col";
};

export const uploadCsv = async (req, res, next) => {
    const file = req.file;
    const { datasetName } = req.body;

    if (!file) {
        return res.status(400).json({ message: "No CSV file uploaded." });
    }

    if (!datasetName) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: "Dataset Name is required." });
    }

    // Expecting JWT token data in req.user
    const { userId, organizationId, showroomId } = req.user;

    const results = [];
    const headers = [];

    fs.createReadStream(file.path)
        .pipe(csvParser({
            mapHeaders: ({ header }) => {
                const safeHeader = sanitizeIdentifier(header.trim());
                headers.push(safeHeader);
                return safeHeader;
            }
        }))
        .on("data", (data) => results.push(data))
        .on("end", async () => {
            // Deduplicate headers in case CSV has identical columns
            const uniqueHeadersSet = new Set();
            const uniqueHeaders = [];

            headers.forEach(h => {
                let finalHeader = h;
                let counter = 1;
                while (uniqueHeadersSet.has(finalHeader)) {
                    finalHeader = `${h}_${counter}`;
                    counter++;
                }
                uniqueHeadersSet.add(finalHeader);
                uniqueHeaders.push(finalHeader);
            });

            const client = await pool.connect();
            try {
                if (results.length === 0) {
                    throw new Error("CSV file is empty.");
                }

                // Create dynamic unique table name
                const randomStr = Math.random().toString(36).substring(2, 8);
                const tableName = `ds_${organizationId.replace(/-/g, "")}_${randomStr}`;

                await client.query("BEGIN");

                // 1. Create Dynamic Table with all TEXT columns to prevent breaking on mixed types
                // We map each header to a 'TEXT' type column
                const columnsDefString = uniqueHeaders.map(col => format("%I TEXT", col)).join(", ");
                const createTableSql = format("CREATE TABLE %I ( _id SERIAL PRIMARY KEY, %s )", tableName, columnsDefString);

                // Note: The manual string concatenation for CREATE TABLE inside pg-format is safe 
                // here because the headers are entirely sanitized by our function.
                const finalCreateTableQuery = `CREATE TABLE ${format('%I', tableName)} ( _id SERIAL PRIMARY KEY, ${columnsDefString} )`;
                await client.query(finalCreateTableQuery);

                // 2. Insert rows in batches of 500
                const BATCH_SIZE = 500;
                for (let i = 0; i < results.length; i += BATCH_SIZE) {
                    const batch = results.slice(i, i + BATCH_SIZE);

                    // We need to map `row` object directly to an array of values based on our `uniqueHeaders` list
                    const rowsToInsert = batch.map(row => {
                        return uniqueHeaders.map(h => {
                            const val = row[h];
                            return (val === "" || val === undefined) ? null : val;
                        });
                    });

                    // Format safely interpolates a nested array as a list of value tuples:
                    // INSERT INTO table (col1, col2) VALUES ('a', '1'), ('b', '2')
                    const insertQuery = format("INSERT INTO %I (%I) VALUES %L", tableName, uniqueHeaders, rowsToInsert);
                    await client.query(insertQuery);
                }

                // 3. Register dataset metadata
                const insertMetadata = `
                    INSERT INTO datasets 
                    (organization_id, showroom_id, name, storage_table_name, uploaded_by, row_count, column_count)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id, name, created_at, storage_table_name
                `;

                const dbRes = await client.query(insertMetadata, [
                    organizationId,
                    showroomId || null, // Allow null since Owner might not have showroom
                    datasetName,
                    tableName,
                    userId,
                    results.length,
                    uniqueHeaders.length
                ]);

                await client.query("COMMIT");

                return res.status(201).json({
                    success: true,
                    dataset: dbRes.rows[0],
                    message: `Successfully processed ${results.length} rows.`
                });

            } catch (err) {
                await client.query("ROLLBACK");
                next(err);
            } finally {
                client.release();
                // Clean up file
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        })
        .on("error", (err) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            next(err);
        });
};
