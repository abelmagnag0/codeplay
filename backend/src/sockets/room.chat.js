const messageService = require('../services/messageService');
const roomPresenceService = require('../services/roomPresenceService');
const roomService = require('../services/roomService');

const userSockets = new Map();

const registerChatHandlers = (io, socket) => {
  const activeRooms = new Set();
  const userId = socket.user.id;
  socket.data.activeRooms = activeRooms;

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket);

  socket.on('room:join', async (roomId, callback) => {
    try {
      if (!roomId) {
        throw Object.assign(new Error('Room id is required'), { status: 400 });
      }

      await messageService.ensureMembership(roomId, userId);

      for (const existingRoomId of Array.from(activeRooms)) {
        if (existingRoomId === roomId) {
          continue;
        }

        socket.leave(existingRoomId);
        activeRooms.delete(existingRoomId);

        const presenceState = roomPresenceService.remove(existingRoomId, userId);
        io.emit('room:presence:update', presenceState);

        const { deleted } = await roomService.leave(existingRoomId, userId);
        if (deleted) {
          io.emit('room:closed', { roomId: existingRoomId });
        }
      }

      const siblingSockets = userSockets.get(userId) || new Set();
      for (const otherSocket of siblingSockets) {
        if (otherSocket === socket) {
          continue;
        }

        const otherRooms = otherSocket.data?.activeRooms;
        if (!otherRooms || otherRooms.size === 0) {
          continue;
        }

        for (const otherRoomId of Array.from(otherRooms)) {
          if (otherRoomId === roomId) {
            continue;
          }

          otherSocket.leave(otherRoomId);
          otherRooms.delete(otherRoomId);

          const presenceState = roomPresenceService.remove(otherRoomId, userId);
          io.emit('room:presence:update', presenceState);

          const { deleted } = await roomService.leave(otherRoomId, userId);
          if (deleted) {
            io.emit('room:closed', { roomId: otherRoomId });
          }

          otherSocket.emit('room:force-leave', {
            roomId: otherRoomId,
            reason: 'exclusive-membership',
          });
        }
      }

      await roomService.join(roomId, userId);
      socket.join(roomId);
      activeRooms.add(roomId);

      const presence = roomPresenceService.add(roomId, socket.user);
      io.emit('room:presence:update', presence);

      if (typeof callback === 'function') {
        callback({ status: 'ok' });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('room:leave', async (roomId, callback) => {
    try {
      if (!roomId) {
        throw Object.assign(new Error('Room id is required'), { status: 400 });
      }

      socket.leave(roomId);
      activeRooms.delete(roomId);

      const presence = roomPresenceService.remove(roomId, socket.user.id);
      io.emit('room:presence:update', presence);

      const { deleted } = await roomService.leave(roomId, userId);
      if (deleted) {
        io.emit('room:closed', { roomId });
      }

      if (typeof callback === 'function') {
        callback({ status: 'ok' });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('message:send', async (payload, callback) => {
    try {
      const { roomId, content } = payload || {};
      if (!roomId || !content) {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      const message = await messageService.send(socket.user, { roomId, content });
      io.to(roomId).emit('message:new', message);

      if (typeof callback === 'function') {
        callback({ status: 'ok', message });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('disconnect', async () => {
    for (const roomId of Array.from(activeRooms)) {
      const presence = roomPresenceService.remove(roomId, socket.user.id);
      io.emit('room:presence:update', presence);

      const { deleted } = await roomService.leave(roomId, userId);
      if (deleted) {
        io.emit('room:closed', { roomId });
      }
    }
    activeRooms.clear();

    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socket);
      if (sockets.size === 0) {
        userSockets.delete(userId);
      }
    }
  });
};

module.exports = registerChatHandlers;
