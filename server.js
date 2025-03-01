import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

console.log("Reached the SERVER JS     server.js");

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins (modify for security)
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ WebSocket connection succeeded");

    // ✅ Listen for "hello" from client
    socket.on("hello", (message) => {
      console.log("📩 Received from client:", message);

      // ✅ Send a response back to the client
      socket.emit("world","resending the message from the server to clinet : "+message);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
