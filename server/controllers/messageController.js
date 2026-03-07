const Message = require('../models/Message');

// @desc    Get all messages for an error room
// @route   GET /api/messages/:errorId
// @access  Public
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ errorId: req.params.errorId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name profileImage');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages };
