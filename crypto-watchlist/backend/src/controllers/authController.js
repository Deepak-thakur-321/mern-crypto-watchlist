const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
exports.registerUser = async (req, res, next) => {
   try {
      const { email, password, name } = req.body;
      if (!email || !password || !name)
         return res.status(400).json({ success: false, message: 'All fields are required' });

      const existingUser = await User.findOne({ email });
      if (existingUser)
         return res.status(409).json({ success: false, message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      const cookieOptions = {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'Strict',
         maxAge: 7 * 24 * 60 * 60 * 1000,
      };

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


// Login user
exports.loginUser = async (req, res, next) => {
   try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      const cookieOptions = {
         httpOnly: true,               // Cannot be accessed by JS
         secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
         sameSite: 'Strict',           // CSRF protection
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

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

//Get user profile
exports.getProfile = async (req, res, next) => {
   try {
      const user = await User.findById(req.user.id).select('-password');
      res.status(200).json({ success: true, user });
   } catch (error) {
      next(error);
   }
};
