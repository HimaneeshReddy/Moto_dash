import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import pool from "./config/db.js"
import authRoute from "./Routes/authRoute.js"
import dataRoute from "./Routes/dataRoute.js"
import adminRoute from "./Routes/adminRoute.js"

dotenv.config()

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


const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Disable Node's built-in timeouts so long-running Ollama inference
// requests are never cut off regardless of how long they take.
// server.setTimeout(0)     — disables the 2-min socket idle timeout
// server.requestTimeout=0  — disables the 5-min (300s) per-request timeout
// server.headersTimeout=0  — disables the 60s headers timeout
server.setTimeout(0);
server.requestTimeout = 0;
server.headersTimeout = 0;

export default app
