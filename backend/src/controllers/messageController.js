const messageService = require('../services/messageService');

const getRoomHistory = async (req, res, next) => {
  try {
    const messages = await messageService.getRoomHistory(req.user, req.params.id, {
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      before: req.query.before,
    });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.send(req.user, {
      roomId: req.params.id,
      content: req.body.content,
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomHistory,
  sendMessage,
};
