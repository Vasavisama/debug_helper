const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  errorId: { type: mongoose.Schema.Types.ObjectId, ref: 'ErrorPost', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
