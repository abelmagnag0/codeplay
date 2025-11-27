const roomPresence = new Map();

const getState = (roomId) => {
  const room = roomPresence.get(roomId);
  if (!room) {
    return { roomId, participants: [] };
  }

  const participants = Array.from(room.values())
    .sort((a, b) => {
      const left = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const right = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return left - right;
    })
    .map(({ connections, ...rest }) => rest);

  return { roomId, participants };
};

const upsertRoom = (roomId) => {
  if (!roomPresence.has(roomId)) {
    roomPresence.set(roomId, new Map());
  }
  return roomPresence.get(roomId);
};

const buildParticipant = (user) => ({
  userId: user.id,
  name: user.name || user.email || 'Participante',
  email: user.email || null,
  avatar: user.avatar || null,
  joinedAt: new Date().toISOString(),
  connections: 1,
});

const add = (roomId, user) => {
  if (!roomId || !user?.id) {
    return getState(roomId);
  }

  const room = upsertRoom(roomId);
  const existing = room.get(user.id);

  if (existing) {
    room.set(user.id, {
      ...existing,
      connections: existing.connections + 1,
      name: user.name || existing.name,
      email: user.email || existing.email,
      avatar: user.avatar || existing.avatar || null,
    });
  } else {
    room.set(user.id, buildParticipant(user));
  }

  return getState(roomId);
};

const remove = (roomId, userId) => {
  const room = roomPresence.get(roomId);
  if (!room || !userId) {
    return getState(roomId);
  }

  const existing = room.get(userId);
  if (!existing) {
    return getState(roomId);
  }

  const connections = Math.max(existing.connections - 1, 0);
  if (connections === 0) {
    room.delete(userId);
  } else {
    room.set(userId, { ...existing, connections });
  }

  if (room.size === 0) {
    roomPresence.delete(roomId);
  }

  return getState(roomId);
};

const removeUserFromAllRooms = (userId) => {
  if (!userId) {
    return [];
  }

  const updatedStates = [];

  for (const [roomId, room] of roomPresence.entries()) {
    if (!room.has(userId)) {
      continue;
    }

    room.delete(userId);

    if (room.size === 0) {
      roomPresence.delete(roomId);
    }

    updatedStates.push(getState(roomId));
  }

  return updatedStates;
};

const clearRoom = (roomId) => {
  if (!roomId) {
    return { roomId, participants: [] };
  }

  roomPresence.delete(roomId);
  return { roomId, participants: [] };
};

module.exports = {
  add,
  remove,
  getState,
  removeUserFromAllRooms,
  clearRoom,
};
