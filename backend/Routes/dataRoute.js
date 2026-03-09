import express from "express";
import { uploadCsv } from "../Controllers/dataController.js";
import { analyzeDataset } from "../Controllers/analyzeController.js";
import { listDatasets, getDatasetRows, addDatasetRow, updateDatasetRow, deleteDatasetRow, getDatasetAnalysis, listAnalyzedDatasets, saveDatasetThumbnail, runInsightQuery, deleteDataset, chatWithDataset } from "../Controllers/crudController.js";
import { upload } from "../Middleware/uploadMiddleware.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// POST /api/data/upload-csv
router.post("/upload-csv", verifyToken, upload.single("file"), uploadCsv);

// GET /api/data/datasets — list all datasets for the org
router.get("/datasets", verifyToken, listDatasets);

// GET /api/data/analyzed — list all datasets that have been analyzed by LLM
router.get("/analyzed", verifyToken, listAnalyzedDatasets);

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

// GET /api/data/:id/analysis — retrieve stored LLM analysis for a dataset
router.get("/:id/analysis", verifyToken, getDatasetAnalysis);

// PATCH /api/data/:id/thumbnail — save an auto-captured dashboard thumbnail
router.patch("/:id/thumbnail", verifyToken, saveDatasetThumbnail);

// POST /api/data/:id/insight-query — run a read-only insight SQL query
router.post("/:id/insight-query", verifyToken, runInsightQuery);

// DELETE /api/data/:id — permanently delete a dataset and all its data
router.delete("/:id", verifyToken, deleteDataset);

// POST /api/data/:id/chat — natural-language → SQL → result chatbot
router.post("/:id/chat", verifyToken, chatWithDataset);

export default router;
