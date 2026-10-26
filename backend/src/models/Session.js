const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 10, default: 0 },
    feedback: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    modelAnswer: { type: String, default: '' },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    question: { type: String, required: true },
    userAnswer: { type: String, required: true },
    evaluation: { type: evaluationSchema, default: () => ({}) },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    strengths: { type: [String], default: [] },
    areasToImprove: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    summary: {
      type: summarySchema,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
