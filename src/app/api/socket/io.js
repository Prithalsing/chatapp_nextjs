import { Server } from 'socket.io';

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket.io server already running');
  } else {
    console.log('Creating new Socket.IO server');
    const io = new Server(res.socket.server);

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

    
      socket.on('join-chat', (chatId) => {
        console.log('Client joined chat:', chatId);
       
        socket.join(chatId); 
      });

      socket.on('send-message', (message) => {
        console.log('Received message:', message);
        
        io.to(message.conversationId).emit('receive-message', message); 
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
      });
    });
  }

  res.end();
}