const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');
const { uploadResume, getUserResumes, getResume, deleteResume } = require('../controllers/resumeController');

// All routes are protected
router.use(protect);

// POST /api/resume/upload
router.post('/upload', uploadSingle('resume'), uploadResume);

// GET /api/resume/
router.get('/', getUserResumes);

// GET /api/resume/:id
router.get('/:id', getResume);

// DELETE /api/resume/:id
router.delete('/:id', deleteResume);

module.exports = router;
