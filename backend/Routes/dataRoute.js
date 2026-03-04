import express from "express";
import { uploadCsv } from "../Controllers/dataController.js";
import { analyzeDataset } from "../Controllers/analyzeController.js";
import { listDatasets, getDatasetRows, addDatasetRow, updateDatasetRow, deleteDatasetRow } from "../Controllers/crudController.js";
import { upload } from "../Middleware/uploadMiddleware.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// POST /api/data/upload-csv
router.post("/upload-csv", verifyToken, upload.single("file"), uploadCsv);

// GET /api/data/datasets — list all datasets for the org
router.get("/datasets", verifyToken, listDatasets);

// POST /api/data/:id/analyze — trigger Ollama analysis
router.post("/:id/analyze", verifyToken, analyzeDataset);

// GET /api/data/:id/rows — paginated rows + optional search
router.get("/:id/rows", verifyToken, getDatasetRows);

// POST /api/data/:id/rows — add a new row
router.post("/:id/rows", verifyToken, addDatasetRow);

// PUT /api/data/:id/rows/:rowId — update a row
router.put("/:id/rows/:rowId", verifyToken, updateDatasetRow);

// DELETE /api/data/:id/rows/:rowId — delete a row
router.delete("/:id/rows/:rowId", verifyToken, deleteDatasetRow);

export default router;
