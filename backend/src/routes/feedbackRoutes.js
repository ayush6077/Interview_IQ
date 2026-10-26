const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Feedback route placeholder — extend as needed
// GET /api/feedback/session/:sessionId
router.get('/session/:sessionId', protect, async (req, res, next) => {
  try {
    const Session = require('../models/Session');
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    }).populate('interviewId', 'targetRole experienceLevel');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const feedback = {
      sessionId: session._id,
      interviewId: session.interviewId,
      overallScore: session.overallScore,
      summary: session.summary,
      answerFeedback: session.answers.map((a) => ({
        questionIndex: a.questionIndex,
        question: a.question,
        userAnswer: a.userAnswer,
        evaluation: a.evaluation,
      })),
      completedAt: session.completedAt,
    };

    res.json({ success: true, data: { feedback } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
