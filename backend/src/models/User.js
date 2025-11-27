const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: { type: [String], default: [] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    bio: { type: String },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    emailVerified: { type: Boolean, default: false },
    emailVerification: {
      token: { type: String },
      expiresAt: { type: Date },
      createdAt: { type: Date },
    },
    passwordReset: {
      token: { type: String },
      expiresAt: { type: Date },
      createdAt: { type: Date },
    },
    refreshTokens: {
      type: [
        {
          tokenId: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
          lastUsedAt: { type: Date, default: Date.now },
          userAgent: { type: String },
          ip: { type: String },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ 'emailVerification.token': 1 }, { sparse: true });
userSchema.index({ 'passwordReset.token': 1 }, { sparse: true });

module.exports = model('User', userSchema);
