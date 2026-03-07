const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');

router.get('/:errorId', getMessages);

module.exports = router;
