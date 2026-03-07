const Vote = require('../models/Vote');
const Solution = require('../models/Solution');
const ErrorPost = require('../models/ErrorPost');
const User = require('../models/User');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private
const castVote = async (req, res) => {
    try {
        const { targetId, targetType, voteType } = req.body;

        // Check for existing vote
        const existingVote = await Vote.findOne({
            userId: req.user._id,
            targetId,
            targetType
        });

        if (existingVote) {
             // If user votes the same way, remove vote
            if(existingVote.voteType === voteType) {
                await Vote.deleteOne({ _id: existingVote._id });
                await updateTargetAndReputation(targetId, targetType, voteType, true); // true = reverse
                return res.json({ message: 'Vote removed' });
            } else {
                // Changing vote (up to down, down to up)
                existingVote.voteType = voteType;
                await existingVote.save();
                
                 // Revert old vote effect, apply new vote effect (effectively double swing)
                await updateTargetAndReputation(targetId, targetType, existingVote.voteType === 'upvote' ? 'downvote' : 'upvote', true);
                await updateTargetAndReputation(targetId, targetType, voteType, false);
                return res.json({ message: 'Vote updated' });
            }
        }

        // New vote
        const newVote = await Vote.create({
            userId: req.user._id,
            targetId,
            targetType,
            voteType
        });

        await updateTargetAndReputation(targetId, targetType, voteType, false);
        res.status(201).json(newVote);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Helper to update the target document's vote count and the owner's reputation
const updateTargetAndReputation = async (targetId, targetType, voteType, reverse = false) => {
    let targetDoc;
    let pointChange = voteType === 'upvote' ? 1 : -1;
    
    if (reverse) {
        pointChange = -pointChange;
    }

    if (targetType === 'error') {
        targetDoc = await ErrorPost.findById(targetId);
        if(targetDoc) {
            targetDoc.votes += pointChange;
            await targetDoc.save();
        }
    } else if (targetType === 'solution') {
        targetDoc = await Solution.findById(targetId);
         if(targetDoc) {
            targetDoc.votes += pointChange;
            await targetDoc.save();
        }
    }

    if (targetDoc) {
        const user = await User.findById(targetDoc.userId);
        if (user) {
            // Grant +10 rep for solution upvote, default +5 for post upvote, -2 for downvote
            let repChange = 0;
            if (targetType === 'solution' && voteType === 'upvote') {
                repChange = 10;
            } else {
                repChange = voteType === 'upvote' ? 5 : -2;
            }
            if(reverse) repChange = -repChange;

            user.reputation += repChange;
            await user.save();
        }
    }
}

module.exports = {
    castVote
};
