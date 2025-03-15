
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { IdCard } from "lucide-react";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Track unique users by userId -> Set of socket IDs
const socketUserMap = new Map(); // socketId -> userId
const roomUsers = new Map(); // roomId -> Set of userIds

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    let currentRoom = "";
    // Handle joining a room
    socket.on("joinRoom", ({ userId, roomId }) => {

      if (!userId || !roomId) return;

      socketUserMap.set(socket.id, userId);
      // Leave previous room if exists
      if (currentRoom) {
        socket.leave(currentRoom);
        if (roomUsers.has(currentRoom)) {
          roomUsers.get(currentRoom).delete(userId);
          io.to(currentRoom).emit("user_count", roomUsers.get(currentRoom).size);
        }
      }

      // Join the new room
      currentRoom = roomId;
      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(userId);

      io.to(roomId).emit("user_count", roomUsers.get(roomId).size);
      console.log(`User ${userId} joined room: ${roomId}`);

      io.to(roomId).emit("message", {
        roomId,
        username: "Server",
        message: `User ${userId} joined room ${roomId}`,
      });
    });


    socket.on("hello", (message) => {
      const useridandmessage = message.split("#1!2@$");
      const userid = useridandmessage[0];

      if (useridandmessage.length > 1) {
        const remainingmessage = useridandmessage[1];
        if (remainingmessage && currentRoom) {
          io.to(currentRoom).emit("world", `${userid}#1!2@$${remainingmessage}`);
        }
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log(socketUserMap)
      const userId = socketUserMap.get(socket.id);

      if (currentRoom && userId) {
        if (roomUsers.has(currentRoom)) {
          roomUsers.get(currentRoom).delete(userId);
          io.to(currentRoom).emit("user_count", roomUsers.get(currentRoom).size);
        }
      }
      console.log(`User ${userId} disconnected`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});