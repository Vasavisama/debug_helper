const Reply = require('../models/Reply');
const Solution = require('../models/Solution');

exports.addReply = async (req, res) => {
    try {
        const { solutionId, replyText } = req.body;
        
        const newReply = new Reply({
            solutionId,
            replyText,
            userId: req.user.id
        });

        await newReply.save();
        await newReply.populate('userId', 'name');

        res.status(201).json(newReply);
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRepliesBySolution = async (req, res) => {
    try {
        const replies = await Reply.find({ solutionId: req.params.solutionId })
            .populate('userId', 'name')
            .sort({ createdAt: 1 });
            
        res.json(replies);
    } catch (error) {
        console.error('Get replies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
