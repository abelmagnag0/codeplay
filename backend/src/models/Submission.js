const { Schema, model, Types } = require('mongoose');

const submissionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: Types.ObjectId, ref: 'Challenge', required: true },
    code: { type: String, required: true },
    language: { type: String },
    isCorrect: { type: Boolean, default: false },
    awardedXp: { type: Number, default: 0 },
    category: { type: String },
  },
  { timestamps: true }
);

module.exports = model('Submission', submissionSchema);
