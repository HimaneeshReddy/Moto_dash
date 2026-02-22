import express from "express";
import {
    createOrganization,
    registerUser,
    loginUser
} from "../Controllers/authController.js";

const router = express.Router();

// Create a new organisation with the registering user as owner
router.post("/create-organization", createOrganization);

// Register an individual user via emailed invite token
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

export default router;