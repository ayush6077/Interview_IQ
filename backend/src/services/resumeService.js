const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { parsePDF } = require('../utils/pdfParser');
const { processResume } = require('./embeddingService');

/**
 * Upload and process a resume file.
 * @param {string} userId
 * @param {object} file - Multer file object
 * @returns {Promise<object>} - Saved Resume document
 */
const uploadResume = async (userId, file) => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  let parsedText = '';

  if (ext === '.pdf') {
    parsedText = await parsePDF(filePath);
  } else {
    // For .doc/.docx files, store a placeholder — full parsing requires mammoth/libreoffice
    parsedText = `[Document: ${file.originalname}] - Text extraction for Word documents requires additional setup.`;
  }

  const resume = await Resume.create({
    userId,
    originalName: file.originalname,
    fileName: file.filename,
    parsedText,
    isProcessed: false,
  });

  // Process embeddings asynchronously (fire and forget with error handling)
  if (parsedText && parsedText.trim().length > 50) {
    processResume(String(resume._id), parsedText).catch((err) => {
      console.error(`Failed to process embeddings for resume ${resume._id}:`, err.message);
    });
  }

  return resume;
};

/**
 * Get all resumes for a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const getUserResumes = async (userId) => {
  return Resume.find({ userId }).sort({ uploadedAt: -1 }).select('-parsedText -chunks');
};

/**
 * Get a specific resume by ID (must belong to the user).
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    const error = new Error('Resume not found');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

/**
 * Delete a resume by ID (must belong to the user).
 * @param {string} resumeId
 * @param {string} userId
 */
const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    const error = new Error('Resume not found');
    error.statusCode = 404;
    throw error;
  }

  // Remove file from disk
  const filePath = path.join(process.env.UPLOAD_PATH || './uploads', resume.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await Resume.findByIdAndDelete(resumeId);
};

module.exports = { uploadResume, getUserResumes, getResume, deleteResume };
