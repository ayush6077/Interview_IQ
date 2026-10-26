const resumeService = require('../services/resumeService');

/**
 * POST /api/resume/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const resume = await resumeService.uploadResume(req.user._id, req.file);
    res.status(201).json({
      success: true,
      data: {
        resume: {
          _id: resume._id,
          originalName: resume.originalName,
          fileName: resume.fileName,
          isProcessed: resume.isProcessed,
          uploadedAt: resume.uploadedAt,
        },
        message: 'Resume uploaded successfully. Processing embeddings in background.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resume/
 */
const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getUserResumes(req.user._id);
    res.json({ success: true, data: { resumes, count: resumes.length } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resume/:id
 */
const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResume(req.params.id, req.user._id);
    res.json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resume/:id
 */
const deleteResume = async (req, res, next) => {
  try {
    await resumeService.deleteResume(req.params.id, req.user._id);
    res.json({ success: true, data: { message: 'Resume deleted successfully' } });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getUserResumes, getResume, deleteResume };
