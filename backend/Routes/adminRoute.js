import express from "express";
import { verifyToken, verifyOwner, verifyManager } from "../Middleware/authMiddleware.js";
import {
    listShowrooms, createShowroom, updateShowroom, deleteShowroom,
    listMembers, removeMember, reassignShowroom,
    listInvites, sendInvite, cancelInvite,
    listRequests, approveRequest, rejectRequest
} from "../Controllers/adminController.js";

const router = express.Router();

// All admin routes require a valid JWT implicitly via token verification first
router.use(verifyToken);

// ── Showrooms ──────────────────────────────────────────────────
router.get("/showrooms", verifyManager, listShowrooms);
router.post("/showrooms", verifyOwner, createShowroom);       // Only owner creates
router.put("/showrooms/:id", verifyOwner, updateShowroom);    // Only owner edits
router.delete("/showrooms/:id", verifyOwner, deleteShowroom); // Only owner deletes

// ── Members ────────────────────────────────────────────────────
router.get("/members", verifyManager, listMembers);
router.patch("/members/:id/showroom", verifyOwner, reassignShowroom); // Only owner moves people cross-showroom
router.delete("/members/:id", verifyOwner, removeMember);             // Only owner kicks people

// ── Invites ────────────────────────────────────────────────────
router.get("/invites", verifyManager, listInvites);
router.post("/invites", verifyManager, sendInvite);         // Managers can invite (RBAC enforced in controller)
router.delete("/invites/:id", verifyManager, cancelInvite); // Managers can cancel invites (RBAC enforced in controller soon)

// ── Requests ───────────────────────────────────────────────────
router.get("/requests", verifyManager, listRequests);
router.post("/requests/:id/approve", verifyOwner, approveRequest);
router.post("/requests/:id/reject", verifyOwner, rejectRequest);

export default router;
