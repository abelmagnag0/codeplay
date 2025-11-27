const messageService = require('../services/messageService');
const screenShareService = require('../services/screenShareService');

const registerScreenShareHandlers = (io, socket) => {
  const ensureMembership = async (roomId, userId) => {
    await messageService.ensureMembership(roomId, userId);
  };

  socket.on('screen:availability', async (payload = {}, callback) => {
    try {
      const { roomId, isAvailable } = payload;
      if (!roomId || typeof isAvailable !== 'boolean') {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);
      const state = await screenShareService.setAvailability(roomId, socket.user.id, isAvailable);

      io.to(roomId).emit('screen:state', state);

      if (typeof callback === 'function') {
        callback({ status: 'ok', state });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('screen:request', async (payload = {}, callback) => {
    try {
      const { roomId } = payload;
      if (!roomId) {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);
      const state = screenShareService.getState(roomId);

      if (!state.isActive) {
        throw Object.assign(new Error('No active screen share'), { status: 409 });
      }

      if (state.ownerUserId === socket.user.id) {
        throw Object.assign(new Error('Presenter already owns the screen share'), { status: 400 });
      }

      io.to(roomId).emit('screen:request', {
        roomId,
        fromUserId: socket.user.id,
        targetUserId: state.ownerUserId,
      });

      if (typeof callback === 'function') {
        callback({ status: 'ok' });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('screen:offer', async (payload = {}, callback) => {
    try {
      const { roomId, targetUserId, description } = payload;
      if (!roomId || !targetUserId || !description) {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);
      await ensureMembership(roomId, targetUserId);

      if (!screenShareService.isSharing(roomId, socket.user.id)) {
        throw Object.assign(new Error('You are not the active presenter'), { status: 403 });
      }

      const eventPayload = {
        roomId,
        fromUserId: socket.user.id,
        targetUserId,
        description,
      };

      io.to(roomId).emit('screen:offer', eventPayload);

      if (typeof callback === 'function') {
        callback({ status: 'ok' });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('screen:answer', async (payload = {}, callback) => {
    try {
      const { roomId, targetUserId, description } = payload;
      if (!roomId || !targetUserId || !description) {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);
      await ensureMembership(roomId, targetUserId);

      const currentState = screenShareService.getState(roomId);
      if (!currentState.isActive) {
        throw Object.assign(new Error('No active screen share'), { status: 409 });
      }

      const updatedState = screenShareService.addViewer(roomId, socket.user.id);

      const eventPayload = {
        roomId,
        fromUserId: socket.user.id,
        targetUserId,
        description,
      };

      io.to(roomId).emit('screen:answer', eventPayload);
      io.to(roomId).emit('screen:state', updatedState);

      if (typeof callback === 'function') {
        callback({ status: 'ok', state: updatedState });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('screen:ice-candidate', async (payload = {}, callback) => {
    try {
      const { roomId, targetUserId, candidate } = payload;
      if (!roomId || !targetUserId || !candidate) {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);
      await ensureMembership(roomId, targetUserId);

      const state = screenShareService.getState(roomId);
      if (!state.isActive) {
        throw Object.assign(new Error('No active screen share'), { status: 409 });
      }

      const eventPayload = {
        roomId,
        fromUserId: socket.user.id,
        targetUserId,
        candidate,
      };

      io.to(roomId).emit('screen:ice-candidate', eventPayload);

      if (typeof callback === 'function') {
        callback({ status: 'ok' });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('screen:end', async (payload = {}, callback) => {
    try {
      const { roomId } = payload;
      if (!roomId) {
        throw Object.assign(new Error('Invalid payload'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);

      let state;
      if (screenShareService.isSharing(roomId, socket.user.id)) {
        state = await screenShareService.clear(roomId, socket.user.id);
      } else {
        state = screenShareService.removeViewer(roomId, socket.user.id);
      }

      io.to(roomId).emit('screen:state', state);

      if (typeof callback === 'function') {
        callback({ status: 'ok', state });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('screen:state:request', async (roomId, callback) => {
    try {
      if (!roomId) {
        throw Object.assign(new Error('Room id is required'), { status: 400 });
      }

      await ensureMembership(roomId, socket.user.id);
      const state = screenShareService.getState(roomId);

      if (typeof callback === 'function') {
        callback({ status: 'ok', state });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: error.message });
      }
    }
  });

  socket.on('disconnect', async () => {
    const affectedStates = await screenShareService.clearForUser(socket.user.id);
    affectedStates.forEach((state) => {
      io.to(state.roomId).emit('screen:state', state);
    });
  });
};

module.exports = registerScreenShareHandlers;
