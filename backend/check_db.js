import pkg from 'pg';
const { Client } = pkg;

async function run() {
    const client = new Client({ host: 'localhost', user: 'postgres', password: 'secret', database: 'dashflow', port: 5432 });
    await client.connect();
    const res = await client.query('SELECT contact_email, email, status, token_hash, expires_at FROM invites ORDER BY created_at DESC LIMIT 5;');
    console.log("==> DB Rows:");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
run();
