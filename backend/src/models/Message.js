const { Schema, model, Types } = require('mongoose');

const messageSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

module.exports = model('Message', messageSchema);
