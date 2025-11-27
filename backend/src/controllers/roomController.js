const roomService = require('../services/roomService');
const screenShareService = require('../services/screenShareService');
const roomPresenceService = require('../services/roomPresenceService');

const toPlainRoom = (room) => {
  if (!room) return room;
  if (typeof room.toJSON === 'function') {
    return room.toJSON({ virtuals: true });
  }
  if (typeof room.toObject === 'function') {
    return room.toObject({ virtuals: true });
  }
  return room;
};

const list = async (_req, res, next) => {
  try {
    const rooms = await roomService.list();
    const payload = rooms.map((room) => {
      const plain = toPlainRoom(room);
      const roomId = plain.id || plain._id?.toString?.();
      const screenShare = screenShareService.getState(roomId);
      const presence = roomPresenceService.getState(roomId);
      return { ...plain, screenShare, presence };
    });
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { room: created, exclusivity } = await roomService.create({ ...req.body, ownerId: req.user.id });
    const room = toPlainRoom(created);
    const roomId = room.id || room._id?.toString?.();
    const screenShare = screenShareService.getState(roomId);
    const presence = roomPresenceService.getState(roomId);
    const payload = { ...room, screenShare, presence };

    const io = req.app.get('io');
    if (io) {
      io.emit('room:created', payload);

      if (exclusivity) {
        if (Array.isArray(exclusivity.affectedRoomIds)) {
          exclusivity.affectedRoomIds.forEach((affectedRoomId) => {
            if (!affectedRoomId) return;
            const state = roomPresenceService.getState(affectedRoomId);
            io.emit('room:presence:update', state);
          });
        }

        if (Array.isArray(exclusivity.deletedRoomIds)) {
          exclusivity.deletedRoomIds.forEach((deletedRoomId) => {
            if (!deletedRoomId) return;
            io.emit('room:closed', { roomId: deletedRoomId });
          });
        }
      }
    }

    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const room = await roomService.getById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const roomId = req.params.id;
    const screenShare = screenShareService.getState(roomId);
    const presence = roomPresenceService.getState(roomId);
    res.status(200).json({ ...toPlainRoom(room), screenShare, presence });
  } catch (error) {
    next(error);
  }
};

const join = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const { room, exclusivity } = await roomService.join(roomId, req.user.id);
    const screenShare = screenShareService.getState(roomId);
    const presence = roomPresenceService.getState(roomId);
    res.status(200).json({ ...toPlainRoom(room), screenShare, presence });

    const io = req.app.get('io');
    if (io && exclusivity) {
      if (Array.isArray(exclusivity.affectedRoomIds)) {
        exclusivity.affectedRoomIds.forEach((affectedRoomId) => {
          if (!affectedRoomId) return;
          const state = roomPresenceService.getState(affectedRoomId);
          io.emit('room:presence:update', state);
        });
      }

      if (Array.isArray(exclusivity.deletedRoomIds)) {
        exclusivity.deletedRoomIds.forEach((deletedRoomId) => {
          if (!deletedRoomId) return;
          io.emit('room:closed', { roomId: deletedRoomId });
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await roomService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  create,
  getById,
  join,
  remove,
};
