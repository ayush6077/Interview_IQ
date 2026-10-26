const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { buildInterviewContext } = require('./ragService');
const { generateQuestions } = require('./llmService');

/**
 * Create a new interview with AI-generated questions.
 * @param {string} userId
 * @param {string} resumeId
 * @param {string} targetRole
 * @param {string} experienceLevel
 * @returns {Promise<object>} - Created Interview document
 */
const createInterview = async (userId, resumeId, targetRole, experienceLevel) => {
  // Validate resume ownership
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    const error = new Error('Resume not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  // Build context using RAG
  const context = await buildInterviewContext(String(resumeId), targetRole, experienceLevel);

  // Generate questions via LLM
  const questions = await generateQuestions(context, targetRole, experienceLevel);

  const interview = await Interview.create({
    userId,
    resumeId,
    targetRole,
    experienceLevel,
    questions,
    status: 'active',
  });

  return interview;
};

/**
 * Get a specific interview by ID (must belong to the user).
 * @param {string} interviewId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getInterview = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId }).populate(
    'resumeId',
    'originalName uploadedAt isProcessed'
  );

  if (!interview) {
    const error = new Error('Interview not found');
    error.statusCode = 404;
    throw error;
  }

  return interview;
};

/**
 * Get all interviews for a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const getUserInterviews = async (userId) => {
  return Interview.find({ userId })
    .populate('resumeId', 'originalName uploadedAt')
    .sort({ createdAt: -1 });
};

module.exports = { createInterview, getInterview, getUserInterviews };
