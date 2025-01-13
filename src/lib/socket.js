import { Server } from "socket.io";

let io;

export const initializeSocketIO = (httpServer) => {
    if (io) {
        return io; 
    }

    io = new Server(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling'], 
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join-chat", (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined chat: ${conversationId}`);

            const room = io.sockets.adapter.rooms.get(conversationId);
            if (room) {
                console.log(`Sockets in room ${conversationId}:`, Array.from(room));
            } else {
                console.log(`Room ${conversationId} is empty.`);
            }
        });

        socket.on("send-message", (message) => {
            console.log("Server received send-message:", message);
            console.log("Emitting receive-message to room:", message.conversationId);
            io.to(message.conversationId).emit("receive-message", message);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
};

export default io;