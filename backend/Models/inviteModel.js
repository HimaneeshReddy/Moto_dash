import crypto from "crypto";
import pool from "../config/db.js";

/**
 * Hash a raw token string with SHA-256 (same as what's stored in DB).
 */
export const hashToken = (rawToken) =>
    crypto.createHash("sha256").update(rawToken).digest("hex");

/**
 * Find a pending, non-expired invite by its hashed token.
 * Returns the full invite row (includes organization_id, showroom_id, role, email).
 */
export const findInviteByToken = async (tokenHash) => {
    const result = await pool.query(
        `SELECT * FROM invites
     WHERE token_hash = $1
       AND status = 'pending'
       AND expires_at > NOW()`,
        [tokenHash]
    );
    return result.rows[0];
};

/**
 * Mark an invite as accepted (must run inside a transaction).
 */
export const markInviteAccepted = async (client, inviteId) => {
    await client.query(
        `UPDATE invites SET status = 'accepted' WHERE id = $1`,
        [inviteId]
    );
};
