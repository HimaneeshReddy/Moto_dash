import express from "express"
import pool from "./config/db.js"

async function run() {
    try {

        // Create the manager_requests table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS manager_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        payload JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Successfully created manager_requests table.");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit(0);
    }
}
run();
