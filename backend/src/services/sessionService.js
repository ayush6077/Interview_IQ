const Session = require('../models/Session');
const Interview = require('../models/Interview');
const { getRelevantContext } = require('./ragService');
const { evaluateAnswer, generateSessionSummary } = require('./llmService');

/**
 * Create a new interview session.
 * @param {string} userId
 * @param {string} interviewId
 * @returns {Promise<object>}
 */
const createSession = async (userId, interviewId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    const error = new Error('Interview not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  if (interview.status === 'completed') {
    const error = new Error('This interview is already completed');
    error.statusCode = 400;
    throw error;
  }

  const session = await Session.create({ userId, interviewId });

  // Update interview status
  await Interview.findByIdAndUpdate(interviewId, { status: 'active' });

  return session;
};

/**
 * Submit and evaluate an answer for a question in a session.
 * @param {string} sessionId
 * @param {string} userId
 * @param {number} questionIndex
 * @param {string} question
 * @param {string} userAnswer
 * @param {string} context - Resume context for RAG
 * @returns {Promise<object>} - Evaluation result
 */
const submitAnswer = async (sessionId, userId, questionIndex, question, userAnswer, context) => {
  const session = await Session.findOne({ _id: sessionId, userId });
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  if (session.status === 'completed') {
    const error = new Error('Session is already completed');
    error.statusCode = 400;
    throw error;
  }

  // Get interview for targetRole
  const interview = await Interview.findById(session.interviewId);
  const targetRole = interview ? interview.targetRole : 'Software Engineer';

  // Get relevant context if not provided
  let ragContext = context;
  if (!ragContext && interview && interview.resumeId) {
    ragContext = await getRelevantContext(String(interview.resumeId), question, 4);
  }

  // Evaluate the answer
  const evaluation = await evaluateAnswer(question, userAnswer, ragContext || '', targetRole);

  // Check if this question was already answered (update) or is new
  const existingIndex = session.answers.findIndex((a) => a.questionIndex === questionIndex);

  const answerEntry = {
    questionIndex,
    question,
    userAnswer,
    evaluation,
    answeredAt: new Date(),
  };

  if (existingIndex >= 0) {
    session.answers[existingIndex] = answerEntry;
  } else {
    session.answers.push(answerEntry);
  }

  await session.save();

  return evaluation;
};

/**
 * Complete a session: generate summary, compute overall score.
 * @param {string} sessionId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const completeSession = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, userId });
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  if (session.status === 'completed') {
    const error = new Error('Session is already completed');
    error.statusCode = 400;
    throw error;
  }

  if (session.answers.length === 0) {
    const error = new Error('Cannot complete a session with no answers');
    error.statusCode = 400;
    throw error;
  }

  // Calculate overall score
  const totalScore = session.answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0);
  const overallScore = Math.round((totalScore / session.answers.length) * 10) / 10;

  // Get interview for targetRole
  const interview = await Interview.findById(session.interviewId);
  const targetRole = interview ? interview.targetRole : 'Software Engineer';

  // Generate summary
  const summary = await generateSessionSummary(session.answers, targetRole);

  session.overallScore = overallScore;
  session.summary = summary;
  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();

  // Update interview status
  if (interview) {
    await Interview.findByIdAndUpdate(interview._id, { status: 'completed' });
  }

  return session;
};

/**
 * Get a specific session (must belong to user).
 * @param {string} sessionId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getSession = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, userId }).populate(
    'interviewId',
    'targetRole experienceLevel questions'
  );

  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  return session;
};

/**
 * Get all sessions for a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const getUserSessions = async (userId) => {
  return Session.find({ userId })
    .populate('interviewId', 'targetRole experienceLevel status')
    .sort({ createdAt: -1 });
};

module.exports = { createSession, submitAnswer, completeSession, getSession, getUserSessions };
