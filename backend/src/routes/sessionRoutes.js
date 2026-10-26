const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSession,
  submitAnswer,
  completeSession,
  getSession,
  getUserSessions,
} = require('../controllers/sessionController');

// All routes are protected
router.use(protect);

// GET /api/session/ — must be before /:sessionId to avoid conflict
router.get('/', getUserSessions);

// POST /api/session/create
router.post('/create', createSession);

// POST /api/session/:sessionId/answer
router.post('/:sessionId/answer', submitAnswer);

// PUT /api/session/:sessionId/complete
router.put('/:sessionId/complete', completeSession);

// GET /api/session/:sessionId
router.get('/:sessionId', getSession);

module.exports = router;
