/**
 * Socket: socketHandler.js
 * MVC Layer: Socket/Event Handler
 * Responsibility: Manages all Socket.io real-time connection logic.
 * Extracted from server.js to keep the entry point clean.
 */

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a private room by userId (for private messages)
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`User ${userId} joined their private room`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
