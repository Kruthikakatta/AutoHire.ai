const express = require('express');
const router = express.Router();
const { getApplications, applyToJob, getStats } = require('../controllers/applicationController');
const auth = require('../middleware/auth');

router.get('/', auth, getApplications);
router.post('/apply/:jobId', auth, applyToJob);
router.get('/stats', auth, getStats);

module.exports = router;
