const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'general'],
      default: 'technical',
      set: (v) => (v ? v.toLowerCase() : 'technical'),
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      set: (v) => (v ? v.toLowerCase() : 'medium'),
    },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead', 'principal'],
      required: [true, 'Experience level is required'],
      set: (v) => (v ? v.toLowerCase() : 'mid'),
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
