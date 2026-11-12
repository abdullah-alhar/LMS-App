const express = require('express');
const { register } = require('../controllers/authController');
const { login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { getMe } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login',login);
router.get('/me', protect, getMe);

module.exports = router;