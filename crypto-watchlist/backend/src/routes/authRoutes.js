const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.use(authLimiter);

const registerValidation = [
   body('name').notEmpty().withMessage('Name is required'),
   body('email').isEmail().withMessage('Valid email is required'),
   body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must contain a number')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
];

const loginValidation = [
   body('email').isEmail().withMessage('Valid email is required'),
   body('password').notEmpty().withMessage('Password is required'),
];

// ===== Routes =====
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/profile', protect, getProfile);

module.exports = router;
