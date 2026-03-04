import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { findUserByEmail, createUser } from "../Models/userModel.js";
import { hashToken, findInviteByToken, markInviteAccepted } from "../Models/inviteModel.js";
import { sendSupportEmail } from "../Utils/email.js";

// ─────────────────────────────────────────────
// CREATE ORGANISATION  (owner registration)
// POST /api/auth/create-organization
// ─────────────────────────────────────────────
export const createOrganization = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { organizationName, firstName, lastName, email, password } = req.body;

        if (!organizationName || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if email is already taken
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        await client.query("BEGIN");

        // 1. Create the organisation with an auto-generated domain (e.g. "Bike Motors" -> "bikemotors.app")
        const domain = organizationName.toLowerCase().replace(/\s+/g, "") + ".app";
        const orgResult = await client.query(
            "INSERT INTO organizations (name, domain) VALUES ($1, $2) RETURNING *",
            [organizationName, domain]
        );
        const organization = orgResult.rows[0];

        // 2. Hash password and create the owner user
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await createUser(client, {
            organizationId: organization.id,
            firstName,
            lastName,
            email,
            passwordHash,
            role: "owner"
        });

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            organization,
            user
        });

    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
};


// ─────────────────────────────────────────────
// REGISTER USER  (invite-token based)
// POST /api/auth/register
// Body: { token, email, firstName, lastName, password }
// ─────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { token, email, firstName, lastName, password } = req.body;

        if (!token || !email || !firstName || !lastName || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Hash the raw token to look it up in the DB
        const tokenHash = hashToken(token);
        const invite = await findInviteByToken(tokenHash);

        // Invite must exist, be pending, and not expired (all checked by model query)
        if (!invite) {
            return res.status(400).json({ message: "Invite is invalid" });
        }

        // The submitted email must exactly match the invited email
        if (invite.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ message: "Invalid or expired invite" });
        }

        // Check the invited email isn't already registered
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        await client.query("BEGIN");

        // Create user — role, org, and showroom all come from the invite
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await client.query(
            `INSERT INTO users
       (organization_id, showroom_id, first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, organization_id, showroom_id, first_name, last_name, email, role, status, created_at`,
            [
                invite.organization_id,
                invite.showroom_id,
                firstName,
                lastName,
                email,
                passwordHash,
                invite.role
            ]
        );
        const newUser = user.rows[0];

        // Mark invite as accepted (inside the same transaction)
        await markInviteAccepted(client, invite.id);

        await client.query("COMMIT");

        // Issue JWT — contains org, showroom, and role from the invite
        const authToken = jwt.sign(
            {
                userId: newUser.id,
                role: newUser.role,
                organizationId: newUser.organization_id,
                showroomId: newUser.showroom_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(201).json({
            success: true,
            token: authToken,
            user: {
                id: newUser.id,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                email: newUser.email,
                role: newUser.role,
                organizationId: newUser.organization_id,
                showroomId: newUser.showroom_id
            }
        });

    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
};


// ─────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Missing credentials" });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                organizationId: user.organization_id,
                showroomId: user.showroom_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id,
                showroomId: user.showroom_id
            }
        });

    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────
// SUBMIT SUPPORT TICKET 
// POST /api/auth/support
// ─────────────────────────────────────────────
export const submitSupportTicket = async (req, res, next) => {
    try {
        const { name, email, type, subject, message } = req.body;

        if (!name || !email || !type || !subject || !message) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Dispatch the email wrapper
        await sendSupportEmail(name, email, type, subject, message);

        return res.status(200).json({
            success: true,
            message: "Support ticket submitted successfully. Our team will contact you shortly."
        });
    } catch (err) {
        next(err);
    }
};