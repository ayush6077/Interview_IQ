const interviewService = require('../services/interviewService');

/**
 * POST /api/interview/create
 */
const createInterview = async (req, res, next) => {
  try {
    const { resumeId, targetRole, experienceLevel } = req.body;

    if (!resumeId || !targetRole || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'resumeId, targetRole, and experienceLevel are required',
      });
    }

    const interview = await interviewService.createInterview(
      req.user._id,
      resumeId,
      targetRole,
      experienceLevel
    );

    res.status(201).json({ success: true, data: { interview } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interview/
 */
const getUserInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getUserInterviews(req.user._id);
    res.json({ success: true, data: { interviews, count: interviews.length } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interview/:id
 */
const getInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterview(req.params.id, req.user._id);
    res.json({ success: true, data: { interview } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInterview, getUserInterviews, getInterview };
