import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messsageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//create express app and HTTP server
const app = express();
const server = http.createServer(app);

//initiate socket.io
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


//store online users
export const userSocketMap = {};

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  //emit online users to all connected clients.
  io.emit("online-users", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware Setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Sever is live"));
app.use("/api/auth", userRouter);
app.use("api/messages", messsageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server is running on PORT:", +PORT));
