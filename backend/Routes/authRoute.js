import express from "express";
import {
    createOrganization,
    registerUser,
    loginUser,
    submitSupportTicket
} from "../Controllers/authController.js";

const router = express.Router();

// Create a new organisation with the registering user as owner
router.post("/create-organization", createOrganization);

// Register an individual user via emailed invite token
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Submit Support Ticket (Public/Protected depending on use-case, kept public here for edge cases where login fails)
router.post("/support", submitSupportTicket);

export default router;