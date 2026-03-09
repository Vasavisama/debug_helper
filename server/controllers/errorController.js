const ErrorPost = require('../models/ErrorPost');

// @desc    Create an error post
// @route   POST /api/errors
// @access  Private
const createErrorPost = async (req, res) => {
  try {
    const { title, description, codeSnippet, technology, tags } = req.body;

    const errorPost = new ErrorPost({
      title,
      description,
      codeSnippet,
      technology,
      tags,
      userId: req.user._id,
    });

    const createdPost = await errorPost.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all error posts & search
// @route   GET /api/errors
// @access  Public
const getErrorPosts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { technology: { $regex: req.query.keyword, $options: 'i' } },
            { tags: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    const errors = await ErrorPost.find({ ...keyword })
      .populate('userId', 'name profileImage reputation')
      .sort({ createdAt: -1 })
      .lean();

    const Solution = require('../models/Solution');
    const errorsWithCounts = await Promise.all(errors.map(async (err) => {
       const answerCount = await Solution.countDocuments({ errorId: err._id });
       return { ...err, answerCount };
    }));

    res.json(errorsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single error post
// @route   GET /api/errors/:id
// @access  Public
const getErrorPostById = async (req, res) => {
  try {
    const errorPost = await ErrorPost.findById(req.params.id)
      .populate('userId', 'name profileImage reputation').lean();

    if (errorPost) {
      const Solution = require('../models/Solution');
      const answerCount = await Solution.countDocuments({ errorId: errorPost._id });

      res.json({ ...errorPost, answerCount });
    } else {
      res.status(404).json({ message: 'Error post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update error post
// @route   PUT /api/errors/:id
// @access  Private
const updateErrorPost = async (req, res) => {
  try {
    const errorPost = await ErrorPost.findById(req.params.id);

    if (errorPost) {
      if (errorPost.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to update this post' });
      }

      errorPost.title = req.body.title || errorPost.title;
      errorPost.description = req.body.description || errorPost.description;
      errorPost.codeSnippet = req.body.codeSnippet || errorPost.codeSnippet;
      errorPost.technology = req.body.technology || errorPost.technology;
      errorPost.tags = req.body.tags || errorPost.tags;
      errorPost.solved = req.body.solved !== undefined ? req.body.solved : errorPost.solved;

      const updatedPost = await errorPost.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Error post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete error post
// @route   DELETE /api/errors/:id
// @access  Private
const deleteErrorPost = async (req, res) => {
  try {
    const errorPost = await ErrorPost.findById(req.params.id);

    if (errorPost) {
      if (errorPost.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to delete this post' });
      }

      await ErrorPost.deleteOne({ _id: req.params.id });
      res.json({ message: 'Error post removed' });
    } else {
      res.status(404).json({ message: 'Error post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get errors by user ID (Dashboard)
// @route   GET /api/errors/user/:userId
// @access  Private
const getUserErrors = async (req, res) => {
    try {
        const errors = await ErrorPost.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(errors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get logged in user's errors (Dashboard)
// @route   GET /api/errors/my
// @access  Private
const getMyQuestions = async (req, res) => {
    try {
        const questions = await ErrorPost.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Increment error view count
// @route   PUT /api/errors/:id/view
// @access  Public
const incrementErrorView = async (req, res) => {
  try {
    const errorPost = await ErrorPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (errorPost) {
      res.json({ views: errorPost.views });
    } else {
      res.status(404).json({ message: 'Error post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createErrorPost,
  getErrorPosts,
  getErrorPostById,
  updateErrorPost,
  deleteErrorPost,
  getUserErrors,
  getMyQuestions,
  incrementErrorView
};
