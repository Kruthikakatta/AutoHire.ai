const express = require('express');
const router = express.Router();
const { uploadResume, optimizeResume, getResumeHistory } = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.post('/optimize/:jobId', auth, optimizeResume);
router.get('/history', auth, getResumeHistory);

module.exports = router;
