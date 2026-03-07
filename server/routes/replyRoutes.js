const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');
const { protect } = require('../middleware/auth');

router.post('/', protect, replyController.addReply);
router.get('/:solutionId', replyController.getRepliesBySolution);

module.exports = router;
