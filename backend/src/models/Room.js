const { Schema, model, Types } = require('mongoose');

const roomSchema = new Schema(
  {
    name: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    ownerId: { type: Types.ObjectId, ref: 'User', required: true },
    participants: { type: [Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

module.exports = model('Room', roomSchema);
