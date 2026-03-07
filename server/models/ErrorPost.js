const mongoose = require('mongoose');

const errorPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  technology: { type: String, required: true },
  tags: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  solved: { type: Boolean, default: false },
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

errorPostSchema.index({ title: 'text', technology: 'text', tags: 'text' });

module.exports = mongoose.model('ErrorPost', errorPostSchema);
