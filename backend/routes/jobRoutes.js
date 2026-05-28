const express = require('express');
const router = express.Router();
const { getJobs, scanEmails, getJobById, deleteJob } = require('../controllers/jobController');
const auth = require('../middleware/auth');

router.get('/', auth, getJobs);
router.post('/scan', auth, scanEmails);
router.get('/:id', auth, getJobById);
router.delete('/:id', auth, deleteJob);

module.exports = router;
