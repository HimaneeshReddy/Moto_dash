import pool from './config/db.js';

async function clearDatasets() {
    try {
        console.log("Clearing all datasets...");

        const res = await pool.query('SELECT storage_table_name FROM datasets');
        for (let row of res.rows) {
            console.log(`Dropping physical table: ${row.storage_table_name}`);
            await pool.query(`DROP TABLE IF EXISTS "${row.storage_table_name}" CASCADE`);
        }

        console.log("Deleting metadata and dataset records...");
        await pool.query('DELETE FROM dataset_metadata');
        await pool.query('DELETE FROM datasets');

        console.log("Successfully wiped all datasets and associated tables.");
        process.exit(0);
    } catch (err) {
        console.error("Failed to clear datasets:", err);
        process.exit(1);
    }
}

clearDatasets();
