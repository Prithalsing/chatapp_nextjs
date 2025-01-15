import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let io;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer, {
    cors: {
      origin: "*", // Change this in production!
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.on("join-chat", (conversationId, callback) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined chat: ${conversationId}`);
      callback({ status: 'ok' }); // Send confirmation back to the client
      
      socket.on("send-message", (message) => {
        console.log("Server received send-message:", message);
        if (message && message.newMessage && message.newMessage.conversationId) {
            const room = message.newMessage.conversationId; // Store in a variable for clarity
            io.to(room).emit("receive-message", message.newMessage);
            console.log(`Emitting receive-message to room: ${room}`);
        } else {
            console.error("Message or conversationId is missing or invalid:", message);
            console.error("Message Object:", JSON.stringify(message, null, 2)); // Log the entire message object
        }
    });
  });

    // socket.on("send-message", (message) => {
    //   console.log("Server received send-message:", message);
    //   if (message.conversationId) {
    //     io.to(message.conversationId).emit("receive-message", message);
    //     console.log(`Emitting receive-message to room: ${message.conversationId}`);
    //   } else {
    //     console.error("Message does not have a conversationId:", message);
    //   }
    // });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
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
