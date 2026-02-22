import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
};

export const createUser = async (client, {
    organizationId,
    firstName,
    lastName,
    email,
    passwordHash,
    role
}) => {
    const result = await client.query(
        `INSERT INTO users
     (organization_id, first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, organization_id, first_name, last_name, email, role, status, created_at`,
        [organizationId, firstName, lastName, email, passwordHash, role]
    );

    return result.rows[0];
};