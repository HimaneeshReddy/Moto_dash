import express from "express";
import { uploadCsv } from "../Controllers/dataController.js";
import { upload } from "../Middleware/uploadMiddleware.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// POST /api/data/upload-csv
// Must be authenticated. Multer handles multi-part form data with "file" key.
router.post("/upload-csv", verifyToken, upload.single("file"), uploadCsv);

export default router;
