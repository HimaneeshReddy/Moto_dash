import pool from "../config/db.js";
import format from "pg-format";

const client = await pool.connect();
try {
    const res = await client.query("SELECT id, name, storage_table_name FROM datasets");
    console.log(`Found ${res.rows.length} dataset(s) to delete:`);

    await client.query("BEGIN");

    for (const row of res.rows) {
        console.log(`  - Dropping raw table: ${row.storage_table_name}`);
        await client.query(format("DROP TABLE IF EXISTS %I", row.storage_table_name));
    }

    const del = await client.query("DELETE FROM datasets RETURNING name");
    console.log("  - Deleted dataset records:", del.rows.map(r => r.name).join(", "));

    await client.query("COMMIT");
    console.log("Done! Database is clean.");
} catch (e) {
    await client.query("ROLLBACK");
    console.error("Error:", e.message);
} finally {
    client.release();
    process.exit(0);
}
