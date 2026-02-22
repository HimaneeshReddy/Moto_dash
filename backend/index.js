import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import pool from "./config/db.js"
import authRoute from "./Routes/authRoute.js"

dotenv.config()

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:6000"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())

app.use("/api/auth", authRoute)


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
