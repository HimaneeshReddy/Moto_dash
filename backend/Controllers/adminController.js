import pool from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendInviteEmail } from "../Utils/email.js";
import { hashToken } from "../Models/inviteModel.js";

// ─────────────────────────────────────────────────────────
// SHOWROOM CRUD
// ─────────────────────────────────────────────────────────

// GET /api/admin/showrooms?search=
export const listShowrooms = async (req, res, next) => {
    try {
        const { organizationId, role: userRole, showroomId: userShowroomId } = req.user;
        const search = req.query.search?.trim() || "";

        let query = `
             SELECT id, name, location, created_at
             FROM showrooms
             WHERE organization_id = $1
               AND ($2 = '' OR name ILIKE $3 OR location ILIKE $3)
        `;
        const params = [organizationId, search, `%${search}%`];

        if (userRole === "manager") {
            query += ` AND id = $4`;
            params.push(userShowroomId);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        return res.json({ showrooms: result.rows });
    } catch (err) { next(err); }
};

// POST /api/admin/showrooms — create showroom
export const createShowroom = async (req, res, next) => {
    const { organizationId } = req.user;
    const { name, location } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Showroom name is required." });
    try {
        const result = await pool.query(
            `INSERT INTO showrooms (organization_id, name, location)
             VALUES ($1, $2, $3) RETURNING id, name, location, created_at`,
            [organizationId, name.trim(), location?.trim() || null]
        );
        return res.status(201).json({ showroom: result.rows[0] });
    } catch (err) { next(err); }
};

// PUT /api/admin/showrooms/:id — update showroom name/location
export const updateShowroom = async (req, res, next) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { name, location } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Showroom name is required." });
    try {
        const result = await pool.query(
            `UPDATE showrooms SET name = $1, location = $2, updated_at = NOW()
             WHERE id = $3 AND organization_id = $4
             RETURNING id, name, location, updated_at`,
            [name.trim(), location?.trim() || null, id, organizationId]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Showroom not found." });
        return res.json({ showroom: result.rows[0] });
    } catch (err) { next(err); }
};

// DELETE /api/admin/showrooms/:id — delete showroom
export const deleteShowroom = async (req, res, next) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM showrooms WHERE id = $1 AND organization_id = $2 RETURNING id`,
            [id, organizationId]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Showroom not found." });
        return res.json({ success: true });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────
// USER / MEMBER MANAGEMENT
// ─────────────────────────────────────────────────────────

// GET /api/admin/members?search=
export const listMembers = async (req, res, next) => {
    try {
        const { organizationId, role: userRole, showroomId: userShowroomId } = req.user;
        const search = req.query.search?.trim() || "";

        let query = `
             SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.status,
                    s.name AS showroom_name, u.created_at
             FROM users u
             LEFT JOIN showrooms s ON u.showroom_id = s.id
             WHERE u.organization_id = $1
               AND ($2 = '' OR u.email ILIKE $3 OR u.first_name ILIKE $3 OR u.last_name ILIKE $3)
        `;
        const params = [organizationId, search, `%${search}%`];

        if (userRole === "manager") {
            query += ` AND u.showroom_id = $4`;
            params.push(userShowroomId);
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await pool.query(query, params);
        return res.json({ members: result.rows });
    } catch (err) { next(err); }
};

// GET /api/admin/invites — list pending invites
export const listInvites = async (req, res, next) => {
    try {
        const { organizationId, role: userRole, showroomId: userShowroomId } = req.user;

        let query = `
            SELECT id, email, role, status, expires_at, created_at
            FROM invites WHERE organization_id = $1 AND status = 'pending'
        `;
        const params = [organizationId];

        if (userRole === "manager") {
            query += ` AND showroom_id = $2`;
            params.push(userShowroomId);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        return res.json({ invites: result.rows });
    } catch (err) { next(err); }
};

// POST /api/admin/invites — send a new invite
// Body: { contactEmail, firstName, lastName, role, showroom_id? }
export const sendInvite = async (req, res, next) => {
    const { organizationId, role: userRole, showroomId: userShowroomId } = req.user;
    let { contactEmail, firstName, lastName, role, showroom_id } = req.body;

    if (!contactEmail || !role || !firstName || !lastName) {
        return res.status(400).json({ message: "Contact email, first name, last name, and role are required." });
    }

    // Role-based Access Control (RBAC) Logic
    if (userRole === "manager") {
        // Managers can ONLY invite analysts
        if (role !== "analyst") {
            return res.status(403).json({ message: "Managers can only invite Analysts." });
        }
        // Managers can ONLY assign to their own showroom
        showroom_id = userShowroomId;

        // INTERCEPT: Create a manager request instead of sending the invite directly
        try {
            const payload = JSON.stringify({ contactEmail, firstName, lastName, role, showroom_id });
            await pool.query(
                `INSERT INTO manager_requests (organization_id, requester_id, action_type, payload)
                 VALUES ($1, $2, 'invite_member', $3) RETURNING id`,
                [organizationId, req.user.userId, payload]
            );
            return res.status(202).json({
                success: true,
                message: "Invite request sent to the Owner for approval."
            });
        } catch (err) {
            return next(err);
        }
    } else {
        // Owners can assign manager or analyst
        if (!["manager", "analyst"].includes(role)) {
            return res.status(400).json({ message: "Role must be 'manager' or 'analyst'." });
        }
    }

    try {
        // Fetch the organization domain/name
        const orgRes = await pool.query(`SELECT name, domain FROM organizations WHERE id = $1`, [organizationId]);
        const orgName = orgRes.rows[0]?.name || "Your Organization";
        const domain = orgRes.rows[0]?.domain || "company.app";

        // Generate the company email ID
        const companyEmailPrefix = `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`.replace(/\s+/g, '');
        let companyEmail = `${companyEmailPrefix}@${domain}`;

        // Check for collisions and add a number if needed (e.g., john.doe2@bikemotors.app)
        let collisionCount = 1;
        while (true) {
            const existing = await pool.query(`SELECT 1 FROM users WHERE email = $1 UNION SELECT 1 FROM invites WHERE email = $1`, [companyEmail]);
            if (existing.rows.length === 0) break;
            collisionCount++;
            companyEmail = `${companyEmailPrefix}${collisionCount}@${domain}`;
        }

        // Generate a secure token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Cancel any existing invite for this contact email in this org
        await pool.query(
            `UPDATE invites SET status = 'cancelled' WHERE contact_email = $1 AND organization_id = $2 AND status = 'pending'`,
            [contactEmail.toLowerCase().trim(), organizationId]
        );

        const result = await pool.query(
            `INSERT INTO invites (organization_id, showroom_id, email, contact_email, role, token_hash, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, contact_email, role, expires_at`,
            [organizationId, showroom_id || null, companyEmail, contactEmail.toLowerCase().trim(), role, tokenHash, expiresAt]
        );

        // Send the invite email using Nodemailer to their PERSONAL email
        try {
            await sendInviteEmail(contactEmail.toLowerCase().trim(), companyEmail, role, orgName, rawToken, req.headers.origin);
        } catch (emailErr) {
            console.error("Failed to send email silently:", emailErr.message);
        }

        return res.status(201).json({
            invite: result.rows[0],
            invite_token: rawToken,
            note: "Invite created and email sent to the user's personal address."
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ message: "An active invite for this email already exists." });
        }
        next(err);
    }
};

// DELETE /api/admin/invites/:id — cancel an invite
export const cancelInvite = async (req, res, next) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE invites SET status = 'cancelled' WHERE id = $1 AND organization_id = $2 RETURNING id`,
            [id, organizationId]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Invite not found." });
        return res.json({ success: true });
    } catch (err) { next(err); }
};

// DELETE /api/admin/members/:id — remove a member (sets status to inactive, preserves history)
export const removeMember = async (req, res, next) => {
    const { organizationId, userId: requestingUserId, role: userRole } = req.user;
    const { id } = req.params;
    if (id === requestingUserId) {
        return res.status(400).json({ message: "You cannot remove yourself." });
    }

    // INTERCEPT: Create a manager request instead of removing directly
    if (userRole === "manager") {
        try {
            await pool.query(
                `INSERT INTO manager_requests (organization_id, requester_id, action_type, target_user_id)
                 VALUES ($1, $2, 'remove_member', $3) RETURNING id`,
                [organizationId, requestingUserId, id]
            );
            return res.status(202).json({
                success: true,
                message: "Removal request sent to the Owner for approval."
            });
        } catch (err) {
            return next(err);
        }
    }

    try {
        const result = await pool.query(
            `UPDATE users SET status = 'inactive', updated_at = NOW()
             WHERE id = $1 AND organization_id = $2 AND role != 'owner'
             RETURNING id, email, status`,
            [id, organizationId]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Member not found or cannot be removed." });
        return res.json({ success: true, member: result.rows[0] });
    } catch (err) { next(err); }
};

// PATCH /api/admin/members/:id/showroom — reassign member to a different showroom
// Body: { showroom_id } (or null to unassign)
export const reassignShowroom = async (req, res, next) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { showroom_id } = req.body;

    try {
        // If a showroom_id was provided, verify it belongs to this org
        if (showroom_id) {
            const srCheck = await pool.query(
                `SELECT id FROM showrooms WHERE id = $1 AND organization_id = $2`,
                [showroom_id, organizationId]
            );
            if (!srCheck.rows.length) {
                return res.status(404).json({ message: "Showroom not found in your organization." });
            }
        }

        const result = await pool.query(
            `UPDATE users SET showroom_id = $1, updated_at = NOW()
             WHERE id = $2 AND organization_id = $3 AND role != 'owner'
             RETURNING id, first_name, last_name, showroom_id`,
            [showroom_id || null, id, organizationId]
        );
        if (!result.rows.length) {
            return res.status(404).json({ message: "Member not found or cannot be reassigned." });
        }
        return res.json({ success: true, member: result.rows[0] });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// MANAGER APPROVAL WORKFLOW
// ─────────────────────────────────────────────────────────────

// GET /api/admin/requests
export const listRequests = async (req, res, next) => {
    const { organizationId, userId, role } = req.user;
    try {
        let query = `
            SELECT mr.*, u.first_name as requester_first, u.last_name as requester_last, tu.email as target_email
            FROM manager_requests mr
            JOIN users u ON mr.requester_id = u.id
            LEFT JOIN users tu ON mr.target_user_id = tu.id
            WHERE mr.organization_id = $1
        `;
        const params = [organizationId];

        if (role === "manager") {
            query += ` AND mr.requester_id = $2`;
            params.push(userId);
        }

        query += ` ORDER BY mr.created_at DESC`;

        const result = await pool.query(query, params);
        return res.json({ requests: result.rows });
    } catch (err) {
        next(err);
    }
};

// POST /api/admin/requests/:id/approve
export const approveRequest = async (req, res, next) => {
    const { organizationId } = req.user;
    const { id } = req.params;

    try {
        // Fetch request
        const reqResult = await pool.query(
            `SELECT * FROM manager_requests WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );
        if (!reqResult.rows.length) return res.status(404).json({ message: "Request not found" });

        const request = reqResult.rows[0];
        if (request.status !== "pending") return res.status(400).json({ message: "Request is already " + request.status });

        if (request.action_type === "remove_member") {
            await pool.query(
                `UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1 AND organization_id = $2`,
                [request.target_user_id, organizationId]
            );
        } else if (request.action_type === "invite_member") {
            const { contactEmail, firstName, lastName, role, showroom_id } = request.payload;

            // Generate company email
            const orgRes = await pool.query(`SELECT name, domain FROM organizations WHERE id = $1`, [organizationId]);
            const orgName = orgRes.rows[0]?.name || "Your Organization";
            const domain = orgRes.rows[0]?.domain || "company.app";
            const prefix = `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`.replace(/\s+/g, '');
            let companyEmail = `${prefix}@${domain}`;

            let collisionCount = 1;
            while (true) {
                const existing = await pool.query(`SELECT 1 FROM users WHERE email = $1 UNION SELECT 1 FROM invites WHERE email = $1`, [companyEmail]);
                if (existing.rows.length === 0) break;
                collisionCount++;
                companyEmail = `${prefix}${collisionCount}@${domain}`;
            }

            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = hashToken(rawToken);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // Cancel any old pending invite to this contact email
            await pool.query(
                `UPDATE invites SET status = 'cancelled' WHERE contact_email = $1 AND organization_id = $2 AND status = 'pending'`,
                [contactEmail.toLowerCase().trim(), organizationId]
            );

            await pool.query(
                `INSERT INTO invites (organization_id, showroom_id, email, contact_email, role, token_hash, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [organizationId, showroom_id || null, companyEmail, contactEmail.toLowerCase().trim(), role, tokenHash, expiresAt]
            );

            // Send Email
            try {
                await sendInviteEmail(contactEmail.toLowerCase().trim(), companyEmail, role, orgName, rawToken, req.headers.origin);
            } catch (err) {
                console.error("Failed to send email silently on approval:", err.message);
            }
        }

        // Mark request approved
        await pool.query(
            `UPDATE manager_requests SET status = 'approved' WHERE id = $1`,
            [id]
        );

        return res.json({ success: true, message: "Request approved and executed." });
    } catch (err) {
        next(err);
    }
};

// POST /api/admin/requests/:id/reject
export const rejectRequest = async (req, res, next) => {
    const { organizationId } = req.user;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE manager_requests SET status = 'rejected' WHERE id = $1 AND organization_id = $2 AND status = 'pending' RETURNING id`,
            [id, organizationId]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Pending request not found." });

        return res.json({ success: true, message: "Request rejected." });
    } catch (err) {
        next(err);
    }
};

