const { Schema, model } = require('mongoose');

const challengeSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category: { type: String, required: true },
    xp: { type: Number, default: 100 },
    starterCode: { type: String },
    solution: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = model('Challenge', challengeSchema);
