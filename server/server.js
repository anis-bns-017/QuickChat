import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { setupSocket, userSocketMap } from "./lib/socket.js";

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
export const io = setupSocket(server);
export { userSocketMap };

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to database
await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
  console.log("Socket.IO server is ready");
});
