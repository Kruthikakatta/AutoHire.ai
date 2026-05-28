const express = require('express');
const router = express.Router();
const { runNLPAcademicBenchmark } = require('../controllers/researchController');
const auth = require('../middleware/auth');

router.post('/benchmark', auth, runNLPAcademicBenchmark);

module.exports = router;
