const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { startInterviewSession, submitQuestionResponse, getSessionsHistory } = require('../controllers/interviewController');
const auth = require('../middleware/auth');

// Create standard upload directory for temporary media storage
const tempUploadDir = 'uploads/media';
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempUploadDir),
  filename: (req, file, cb) => cb(null, `interview-${req.user.id}-${Date.now()}${path.extname(file.originalname) || '.webm'}`)
});

// Configure media upload limits (typically 20MB for micro WebRTC recordings)
const uploadMedia = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

router.get('/history', auth, getSessionsHistory);
router.post('/start/:jobId', auth, startInterviewSession);
router.post('/submit', auth, uploadMedia.single('media'), submitQuestionResponse);

module.exports = router;
