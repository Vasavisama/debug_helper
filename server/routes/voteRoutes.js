const express = require('express');
const router = express.Router();
const { castVote } = require('../controllers/voteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, castVote);

module.exports = router;
