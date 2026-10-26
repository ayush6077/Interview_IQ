const sessionService = require('../services/sessionService');

/**
 * POST /api/session/create
 */
const createSession = async (req, res, next) => {
  try {
    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'interviewId is required' });
    }

    const session = await sessionService.createSession(req.user._id, interviewId);
    res.status(201).json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/session/:sessionId/answer
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, question, userAnswer, context } = req.body;

    if (questionIndex === undefined || !question || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'questionIndex, question, and userAnswer are required',
      });
    }

    const evaluation = await sessionService.submitAnswer(
      sessionId,
      req.user._id,
      questionIndex,
      question,
      userAnswer,
      context || ''
    );

    res.json({ success: true, data: { evaluation } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/session/:sessionId/complete
 */
const completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionService.completeSession(sessionId, req.user._id);
    res.json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/session/:sessionId
 */
const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionService.getSession(sessionId, req.user._id);
    res.json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/session/
 */
const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getUserSessions(req.user._id);
    res.json({ success: true, data: { sessions, count: sessions.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSession, submitAnswer, completeSession, getSession, getUserSessions };
