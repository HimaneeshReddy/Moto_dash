import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Basic checking for text CSV or Excel files. 
    // Fallback if mimetype isn't directly matching: we can check extension too.
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".csv" || file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed"), false);
    }
};

export const upload = multer({ storage, fileFilter });
