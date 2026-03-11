const Solution = require('../models/Solution');
const ErrorPost = require('../models/ErrorPost');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendAnswerNotification = require('../utils/emailService');

const evaluateAnswerAccuracy = require('../utils/aiAccuracyEvaluator');

// @desc    Add a solution
// @route   POST /api/solutions
// @access  Private
const addSolution = async (req, res) => {
  try {
    const { errorId, solutionText } = req.body;

    const errorPost = await ErrorPost.findById(errorId);
    if (!errorPost) {
        return res.status(404).json({ message: 'Question not found' });
    }

    const solution = new Solution({
      errorId,
      userId: req.user._id,
      solutionText,
    });

    const createdSolution = await solution.save();

    // After saving normally, attempt AI evaluation securely without breaking the request
    try {
      const aiResult = await evaluateAnswerAccuracy(
        errorPost.description,
        solutionText
      );

      if (aiResult) {
        createdSolution.aiAccuracy = aiResult.accuracy;

        let points = 0;
        if (aiResult.accuracy >= 90) points = 20;
        else if (aiResult.accuracy >= 75) points = 15;
        else if (aiResult.accuracy >= 50) points = 10;
        else if (aiResult.accuracy >= 30) points = 5;
        else points = 1;

        createdSolution.aiPoints = points;
        await createdSolution.save();

        if (points > 0) {
            await User.findByIdAndUpdate(req.user._id, { $inc: { points: points } });
        }
      }
    } catch (aiError) {
      console.error("Non-fatal AI evaluation error:", aiError);
    }

    // Create notification for error author
    if (errorPost.userId.toString() !== req.user._id.toString()) {
        await Notification.create({
            userId: errorPost.userId,
            message: `${req.user.name} posted a solution to your error: ${errorPost.title}`,
            type: 'answer'
        });

        // Send email notification to question author (non-blocking)
        const questionAuthor = await User.findById(errorPost.userId);
        if (questionAuthor && questionAuthor.email) {
            sendAnswerNotification(questionAuthor.email, errorPost.title, errorPost._id)
                .catch(err => console.error("Email notification failed:", err.message));
        }
    }

    // Add +5 reputation for posting an answer
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 5 } });

    res.status(201).json(createdSolution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get solutions for an error
// @route   GET /api/solutions/:errorId
// @access  Public
const getSolutions = async (req, res) => {
  try {
    let solutions = await Solution.find({ errorId: req.params.errorId })
      .populate('userId', 'name profileImage reputation')
      .sort({ aiAccuracy: -1, votes: -1, createdAt: -1 })
      .lean();

    const Reply = require('../models/Reply');
    for (let solution of solutions) {
        solution.replies = await Reply.find({ solutionId: solution._id })
            .populate('userId', 'name')
            .sort({ createdAt: 1 })
            .lean();
    }

    res.json(solutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a solution
// @route   PUT /api/solutions/:id
// @access  Private
const updateSolution = async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (solution) {
      if (solution.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to update this solution' });
      }

      solution.solutionText = req.body.solutionText || solution.solutionText;
      const updatedSolution = await solution.save();
      res.json(updatedSolution);
    } else {
      res.status(404).json({ message: 'Solution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a solution
// @route   DELETE /api/solutions/:id
// @access  Private
const deleteSolution = async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (solution) {
      if (solution.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to delete this solution' });
      }

      await Solution.deleteOne({ _id: req.params.id });
      res.json({ message: 'Solution removed' });
    } else {
      res.status(404).json({ message: 'Solution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark solution as accepted
// @route   PUT /api/solutions/:id/accept
// @access  Private
const acceptSolution = async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id);
        if(!solution) return res.status(404).json({ message: 'Solution not found' });

        const errorPost = await ErrorPost.findById(solution.errorId);
        
        // Only author of the error post can accept a solution
        if (errorPost.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the error post author can accept a solution' });
        }

        // Un-accept previous solutions if they exist (optional, assuming 1 accepted solution per post)
        await Solution.updateMany({ errorId: solution.errorId }, { accepted: false });

        solution.accepted = true;
        await solution.save();

        errorPost.solved = true;
        await errorPost.save();

        // Create notification for solution author
        if(solution.userId.toString() !== req.user._id.toString()) {
            await Notification.create({
                userId: solution.userId,
                message: `${req.user.name} accepted your solution on: ${errorPost.title}`,
                type: 'accepted'
            });
        }

        // Add +25 reputation for having an answer accepted
        await User.findByIdAndUpdate(solution.userId, { $inc: { reputation: 25 } });

        res.json(solution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get solutions by user ID (Dashboard)
// @route   GET /api/solutions/user/:userId
// @access  Private
const getUserSolutions = async (req, res) => {
    try {
        const solutions = await Solution.find({ userId: req.params.userId })
            .populate('errorId', 'title')
            .sort({ createdAt: -1 });
        res.json(solutions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
  addSolution,
  getSolutions,
  updateSolution,
  deleteSolution,
  acceptSolution,
  getUserSolutions
};
