const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    parsedText: {
      type: String,
      default: '',
    },
    chunks: {
      type: [String],
      default: [],
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    vectorStoreId: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
