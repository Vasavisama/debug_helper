const express = require('express');
const router = express.Router();
const {
  createErrorPost,
  getErrorPosts,
  getErrorPostById,
  updateErrorPost,
  deleteErrorPost,
  getUserErrors,
  incrementErrorView
} = require('../controllers/errorController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createErrorPost)
  .get(getErrorPosts);

// These must come BEFORE /:id to avoid Express matching "user" or "my" as an :id
router.route('/user/:userId')
    .get(protect, getUserErrors);

router.route('/:id/view')
  .put(incrementErrorView);

router.route('/:id')
  .get(getErrorPostById)
  .put(protect, updateErrorPost)
  .delete(protect, deleteErrorPost);

module.exports = router;
