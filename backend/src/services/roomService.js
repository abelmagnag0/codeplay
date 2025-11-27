const roomRepository = require('../repositories/roomRepository');
const screenShareService = require('./screenShareService');
const roomPresenceService = require('./roomPresenceService');

const EMPTY_ROOM_TTL_MS = Number(process.env.EMPTY_ROOM_TTL_MS) || 15_000;

const list = () => roomRepository.findAll();

const ensureExclusiveMembership = async (userId, targetRoomId = null) => {
  if (!userId) {
    return { affectedRoomIds: [], deletedRoomIds: [] };
  }

  const rooms = await roomRepository.findByParticipant(userId, {
    excludeRoomId: targetRoomId || undefined,
  });

  const affectedRoomIds = [];
  const deletedRoomIds = [];

  for (const room of rooms) {
    const { deleted, roomId } = await roomRepository.removeParticipant(room._id, userId);
    affectedRoomIds.push(roomId);
    if (deleted) {
      deletedRoomIds.push(roomId);
      screenShareService.forceClear(roomId);
    }
  }

  return { affectedRoomIds, deletedRoomIds };
};

const create = async (payload) => {
  const ownerId = payload.ownerId;
  const exclusivity = await ensureExclusiveMembership(ownerId);

  const room = await roomRepository.create({
    ...payload,
    participants: [ownerId],
  });

  return { room, exclusivity };
};

const getById = (id) => roomRepository.findById(id);

const join = async (roomId, userId) => {
  const exclusivity = await ensureExclusiveMembership(userId, roomId);
  const room = await roomRepository.addParticipant(roomId, userId);
  return { room, exclusivity };
};

const leave = async (roomId, userId) => {
  const { room, removed, deleted, roomId: resolvedRoomId } = await roomRepository.removeParticipant(
    roomId,
    userId,
  );

  if (deleted) {
    screenShareService.forceClear(resolvedRoomId);
  }

  return { room, removed, deleted, roomId: resolvedRoomId };
};

const remove = async (id) => {
  await screenShareService.forceClear(id);
  return roomRepository.deleteById(id);
};

const pruneEmptyRooms = async () => {
  const rooms = await roomRepository.findAll();
  const removedRoomIds = [];
  const now = Date.now();

  for (const room of rooms) {
    const roomId = room._id?.toString?.() || room.id;
    if (!roomId) {
      continue;
    }

    const presence = roomPresenceService.getState(roomId);
    if (presence.participants.length > 0) {
      continue;
    }

    const updatedAtValue = room.updatedAt instanceof Date ? room.updatedAt : new Date(room.updatedAt);
    const isDate = updatedAtValue instanceof Date && !Number.isNaN(updatedAtValue.getTime());
    const ageMs = isDate ? now - updatedAtValue.getTime() : Number.POSITIVE_INFINITY;

    if (ageMs < EMPTY_ROOM_TTL_MS) {
      continue;
    }

    await roomRepository.deleteById(roomId);
    screenShareService.forceClear(roomId);
    roomPresenceService.clearRoom(roomId);
    removedRoomIds.push(roomId);
  }

  return removedRoomIds;
};

module.exports = {
  list,
  create,
  getById,
  join,
  leave,
  remove,
  ensureExclusiveMembership,
  pruneEmptyRooms,
};
