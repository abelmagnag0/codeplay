const registerChatHandlers = (_io, socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('message', ({ roomId, message }) => {
    if (roomId) {
      socket.to(roomId).emit('message', { message, userId: socket.id, timestamp: new Date() });
    }
  });
};

module.exports = registerChatHandlers;
