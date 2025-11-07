const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ===== Helper: Generate JWT =====
const generateToken = (userId) => {
   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ===== Cookie Options =====
const cookieOptions = {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'Strict',
   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ===== Register User =====
exports.registerUser = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Pre-save hook will hash password
      const user = await User.create({ name, email, password });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res
         .status(201)
         .cookie('token', token, cookieOptions)
         .json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
         });
   } catch (error) {
      next(error);
   }
};


// ===== Login User =====
exports.loginUser = async (req, res, next) => {
   try {
      // 1️⃣ Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // 2️⃣ Find user + include password
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      // 3️⃣ Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      // 4️⃣ Generate JWT
      const token = generateToken(user._id);

      // 5️⃣ Send cookie + response
      res
         .status(200)
         .cookie('token', token, cookieOptions)
         .json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
         });
   } catch (error) {
      next(error);
   }
};

// ===== Get User Profile =====
exports.getProfile = async (req, res, next) => {
   try {
      const user = await User.findById(req.user.id).select('-password');
      res.status(200).json({ success: true, user });
   } catch (error) {
      next(error);
   }
};
