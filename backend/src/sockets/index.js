const registerChatHandlers = require('./room.chat');

const registerSocketHandlers = (io, socket) => {
  registerChatHandlers(io, socket);
};

module.exports = registerSocketHandlers;
