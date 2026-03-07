const express = require('express');
const router = express.Router();
const {
  addSolution,
  getSolutions,
  updateSolution,
  deleteSolution,
  acceptSolution,
  getUserSolutions
} = require('../controllers/solutionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, addSolution);

router.route('/:errorId')
  .get(getSolutions); 

router.route('/:id')
  .put(protect, updateSolution)
  .delete(protect, deleteSolution);

router.put('/:id/accept', protect, acceptSolution);

router.get('/user/:userId', protect, getUserSolutions);

module.exports = router;
