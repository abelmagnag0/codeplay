const registerChatHandlers = require('./room.chat');
const registerScreenShareHandlers = require('./room.screen');

const registerSocketHandlers = (io, socket) => {
  registerChatHandlers(io, socket);
  registerScreenShareHandlers(io, socket);
};

module.exports = registerSocketHandlers;
