import pkg from 'pg';
const { Client } = pkg;

async function run() {
    const client = new Client({ host: 'localhost', user: 'postgres', password: 'secret', database: 'dashflow', port: 5432 });
    try {
        await client.connect();
        const res = await client.query("DELETE FROM invites");
        console.log(`Successfully deleted ${res.rowCount} invites from the database.`);
    } catch (err) {
        console.error("Error deleting invites:", err);
    } finally {
        await client.end();
    }
}
run();
