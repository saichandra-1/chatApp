import { createServer } from "node:http";
import { Server } from "socket.io";

const port = process.env.PORT || 3001;  // Use a dynamic port for deployment

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (for testing, secure this later)
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ WebSocket connection succeeded");

  socket.on("hello", (message) => {
    console.log("📩 Received from client:", message);
    socket.emit("world", "Server response: " + message);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
