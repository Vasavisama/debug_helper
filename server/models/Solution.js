const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  errorId: { type: mongoose.Schema.Types.ObjectId, ref: 'ErrorPost', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  solutionText: { type: String, required: true },
  votes: { type: Number, default: 0 },
  accepted: { type: Boolean, default: false },
  accuracyScore: { type: Number, default: null },
  accuracyReason: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Solution', solutionSchema);
