const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['error', 'solution'], required: true },
  voteType: { type: String, enum: ['upvote', 'downvote'], required: true }
}, { timestamps: true });

// Prevent duplicate votes by the same user on the same entity
voteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
