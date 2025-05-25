import { Server } from "socket.io";

export const userSocketMap = {};

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected:", userId);

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    // Emit online users to all clients
    io.emit("online-users", Object.keys(userSocketMap));

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      if (userId && userSocketMap[userId]) {
        delete userSocketMap[userId];
        io.emit("online-users", Object.keys(userSocketMap));
      }
    });

    // Handle socket errors
    socket.on("error", (err) => {
      console.error("Socket error for user", userId, ":", err);
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  });

  // Handle server-level connection errors
  io.engine.on("connection_error", (err) => {
    console.log("Engine.IO connection error:");
    console.log("Request:", err.req?.url);
    console.log("Code:", err.code);
    console.log("Message:", err.message);
  });

  return io;
};
