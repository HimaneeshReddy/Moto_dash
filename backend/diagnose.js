import pool from './config/db.js';

async function diagnose() {
    try {
        // Step 1: Check datasets table
        const dsResult = await pool.query('SELECT id, name, storage_table_name, row_count FROM datasets ORDER BY created_at DESC LIMIT 5');
        console.log('\n=== DATASETS ===');
        if (!dsResult.rows.length) { console.log('❌ NO DATASETS FOUND'); process.exit(0); }
        console.log(JSON.stringify(dsResult.rows, null, 2));

        const latest = dsResult.rows[0];
        const { id, name, storage_table_name, row_count } = latest;

        // Step 2: Check metadata
        const metaResult = await pool.query(
            `SELECT dataset_id, (metadata->'llm_analysis') IS NOT NULL AS has_analysis, 
             jsonb_object_keys(metadata) AS keys
             FROM dataset_metadata WHERE dataset_id = $1`, [id]
        );
        console.log('\n=== METADATA ===');
        console.log(JSON.stringify(metaResult.rows, null, 2));

        // Step 3: Check actual rows in the physical table
        try {
            const rowResult = await pool.query(`SELECT * FROM "${storage_table_name}" LIMIT 5`);
            console.log('\n=== SAMPLE ROWS ===');
            console.log('Count:', rowResult.rows.length);
            console.log('Columns:', Object.keys(rowResult.rows[0] || {}));
            console.log(JSON.stringify(rowResult.rows.slice(0, 2), null, 2));
        } catch (e) {
            console.log('❌ FAILED to query storage table:', e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error('DIAGNOSTIC FAILED:', e.message);
        process.exit(1);
    }
}

diagnose();
