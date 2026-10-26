const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInterview, getUserInterviews, getInterview } = require('../controllers/interviewController');

// All routes are protected
router.use(protect);

// POST /api/interview/create
router.post('/create', createInterview);

// GET /api/interview/
router.get('/', getUserInterviews);

// GET /api/interview/:id
router.get('/:id', getInterview);

module.exports = router;
