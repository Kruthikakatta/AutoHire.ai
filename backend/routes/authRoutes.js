const express = require('express');
const router = express.Router();
const { register, login, googleAuth, googleCallback, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/profile', auth, getProfile);

module.exports = router;
