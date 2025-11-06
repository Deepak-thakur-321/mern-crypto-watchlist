const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.use(authLimiter);

// === Auth Routes ===
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, getProfile);

module.exports = router;
