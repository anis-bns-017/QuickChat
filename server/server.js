import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messsageRouter from "./routes/messageRoutes.js";

//create express app and HTTP server
const app = express();
const server = http.createServer(app);

//Middleware Setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Sever is live"));
app.use("/api/auth", userRouter)
app.use("api/messages", messsageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server is running on PORT:", + PORT));
