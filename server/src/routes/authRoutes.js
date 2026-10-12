const express = require('express');
const router = express.Router();
const { register, login, getMe, demoLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

module.exports = router;
