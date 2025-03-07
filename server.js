import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // Allow all origins (for testing)
  });

  io.on("connection", (socket) => {
    console.log("WebSocket connection succeeded");
    
    // Listen for "hello" messages from clients
    socket.on("hello", (message) => {
      const useridandmessage = message.split("#1!2@$");
      const userid = useridandmessage[0];
      if(useridandmessage.length > 1){
        const remainingmessage = useridandmessage[1];
        if(remainingmessage){
          io.emit("world", `${userid}#1!2@$${remainingmessage}`); 
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});