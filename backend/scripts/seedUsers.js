import pool from "../config/db.js";
import bcrypt from "bcrypt";

const ORG_ID = "e200ac7f-1114-49e4-b0bb-cfe20c8a77ac";
const PASSWORD = "Test@1234"; // same password for all seed users

const users = [
    { first_name: "Arjun", last_name: "Sharma", email: "arjun.sharma@bikemotors.in", role: "manager" },
    { first_name: "Priya", last_name: "Nair", email: "priya.nair@bikemotors.in", role: "analyst" },
    { first_name: "Rahul", last_name: "Verma", email: "rahul.verma@bikemotors.in", role: "manager" },
    { first_name: "Sneha", last_name: "Iyer", email: "sneha.iyer@bikemotors.in", role: "analyst" },
    { first_name: "Karthik", last_name: "Reddy", email: "karthik.reddy@bikemotors.in", role: "analyst" },
];

const hash = await bcrypt.hash(PASSWORD, 10);

let inserted = 0;
for (const u of users) {
    try {
        await pool.query(
            `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO NOTHING`,
            [ORG_ID, u.first_name, u.last_name, u.email, hash, u.role]
        );
        console.log(`✔ Inserted: ${u.first_name} ${u.last_name} (${u.role})`);
        inserted++;
    } catch (e) {
        console.error(`✘ Skipped ${u.email}: ${e.message}`);
    }
}

console.log(`\nDone! Seeded ${inserted} user(s). Password for all: ${PASSWORD}`);
process.exit(0);
