const roomRepository = require('../repositories/roomRepository');

const activeShares = new Map();

const buildState = (roomId) => {
  const state = activeShares.get(roomId) || null;
  if (!state) {
    return { roomId, isActive: false, ownerUserId: null, viewers: [] };
  }
  return {
    roomId,
    isActive: true,
    ownerUserId: state.ownerUserId,
    viewers: Array.from(state.viewers || new Set()),
  };
};

const setAvailability = async (roomId, userId, isAvailable) => {
  if (typeof isAvailable !== 'boolean') {
    const error = new Error('Availability flag must be boolean');
    error.status = 400;
    throw error;
  }

  const room = await roomRepository.findById(roomId);
  if (!room) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  const current = activeShares.get(roomId);

  if (!isAvailable) {
    if (current && current.ownerUserId && current.ownerUserId !== userId) {
      const error = new Error('Only the active presenter can disable sharing');
      error.status = 403;
      throw error;
    }

    activeShares.delete(roomId);
    return buildState(roomId);
  }

  if (current && current.ownerUserId && current.ownerUserId !== userId) {
    const error = new Error('Screen share already in progress');
    error.status = 409;
    throw error;
  }

  activeShares.set(roomId, {
    ownerUserId: userId,
    viewers: new Set(),
  });

  return buildState(roomId);
};

const clear = async (roomId, userId) => {
  const current = activeShares.get(roomId);
  if (!current) {
    return buildState(roomId);
  }

  if (current.ownerUserId && current.ownerUserId !== userId) {
    const error = new Error('Only the active presenter can end sharing');
    error.status = 403;
    throw error;
  }

  activeShares.delete(roomId);
  return buildState(roomId);
};

const forceClear = (roomId) => {
  if (!roomId) {
    return { roomId, isActive: false, ownerUserId: null, viewers: [] };
  }

  activeShares.delete(roomId);
  return buildState(roomId);
};

const clearForUser = async (userId) => {
  const affectedRooms = [];
  for (const [roomId, state] of activeShares.entries()) {
    if (state.ownerUserId === userId) {
      activeShares.delete(roomId);
      affectedRooms.push(buildState(roomId));
    } else if (state.viewers?.has(userId)) {
      state.viewers.delete(userId);
      activeShares.set(roomId, state);
      affectedRooms.push(buildState(roomId));
    }
  }

  return affectedRooms;
};

const addViewer = (roomId, userId) => {
  const state = activeShares.get(roomId);
  if (!state || state.ownerUserId === userId) {
    return buildState(roomId);
  }

  if (!state.viewers) {
    state.viewers = new Set();
  }

  state.viewers.add(userId);
  activeShares.set(roomId, state);
  return buildState(roomId);
};

const removeViewer = (roomId, userId) => {
  const state = activeShares.get(roomId);
  if (!state || !state.viewers) {
    return buildState(roomId);
  }

  state.viewers.delete(userId);
  activeShares.set(roomId, state);
  return buildState(roomId);
};

const getState = (roomId) => buildState(roomId);

const isSharing = (roomId, userId) => {
  const state = activeShares.get(roomId);
  return Boolean(state && state.ownerUserId === userId);
};

module.exports = {
  setAvailability,
  clear,
  clearForUser,
  buildState,
  getState,
  addViewer,
  removeViewer,
  isSharing,
  forceClear,
};
