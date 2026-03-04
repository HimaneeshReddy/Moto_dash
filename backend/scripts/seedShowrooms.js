import pool from "../config/db.js";

const ORG_ID = "e200ac7f-1114-49e4-b0bb-cfe20c8a77ac";

// Create showrooms 2 and 3
const showrooms = [
    { name: "BikeMotors Showroom 2", location: "Bangalore" },
    { name: "BikeMotors Showroom 3", location: "Hyderabad" },
];

const [sr2, sr3] = await Promise.all(
    showrooms.map(s =>
        pool.query(
            `INSERT INTO showrooms (organization_id, name, location) VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING RETURNING id, name`,
            [ORG_ID, s.name, s.location]
        )
    )
);

const showroom2Id = sr2.rows[0]?.id;
const showroom3Id = sr3.rows[0]?.id;
console.log(`✔ Showroom 2: ${showroom2Id}`);
console.log(`✔ Showroom 3: ${showroom3Id}`);

// Assign users to showrooms — distribute evenly
const users = await pool.query(
    `SELECT id, first_name FROM users WHERE organization_id = $1 AND role != 'owner' ORDER BY created_at`,
    [ORG_ID]
);

for (let i = 0; i < users.rows.length; i++) {
    const u = users.rows[i];
    const srId = i % 2 === 0 ? showroom2Id : showroom3Id;
    await pool.query(
        `UPDATE users SET showroom_id = $1 WHERE id = $2`,
        [srId, u.id]
    );
    console.log(`  → ${u.first_name} assigned to Showroom ${i % 2 === 0 ? 2 : 3}`);
}

console.log("\nDone!");
process.exit(0);
