import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import pool from "./config/db.js"
import authRoute from "./Routes/authRoute.js"
import dataRoute from "./Routes/dataRoute.js"
import adminRoute from "./Routes/adminRoute.js"

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:6000"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRoute)
app.use("/api/data", dataRoute)
app.use("/api/admin", adminRoute)

// Serve uploaded files (showroom covers, etc.) as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// One-time safe migrations (ensure tables exist before handling requests)
Promise.all([
  pool.query(`ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS cover_image TEXT`).then(() => console.log("✓ Migration: cover_image column")).catch(err => console.error("Migration (cover_image):", err.message)),
  pool.query(`
    CREATE TABLE IF NOT EXISTS showroom_financials (
      id SERIAL PRIMARY KEY,
      showroom_id INT,
      dataset_id INT UNIQUE,
      dataset_type TEXT DEFAULT 'other',
      dataset_type_label TEXT,
      revenue NUMERIC DEFAULT 0,
      expenditure NUMERIC DEFAULT 0,
      salary_expense NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).then(() => console.log("✓ Migration: showroom_financials table")).catch(err => console.error("Migration (financials):", err.message))
]).then(() => {
  const PORT = process.env.PORT || 5000
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
  server.setTimeout(0);
  server.requestTimeout = 0;
  server.headersTimeout = 0;
})

export default app
