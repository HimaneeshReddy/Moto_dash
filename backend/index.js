import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"


dotenv.config()

const app = express()

app.use(cors({
  origin: ["http://localhost:6000"],
  credentials: true
}))

app.use(express.json())

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB")
}).catch((err) => {
  console.log("Error connecting to MongoDB:", err)
})


const PORT = process.env.PORT || 5000;






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

console.log("Backend server is running")

export default app