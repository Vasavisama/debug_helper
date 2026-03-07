const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    solutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solution',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    replyText: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reply', ReplySchema);
