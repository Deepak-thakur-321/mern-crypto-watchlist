const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
   try {
      let token;

      // 1️⃣ Check cookie first
      if (req.cookies && req.cookies.token) {
         token = req.cookies.token;
      }

      // 2️⃣ Fallback: Authorization header
      if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
         return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
      }

      // 3️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Attach user to request
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
         return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      req.user = user;
      next();
   } catch (error) {
      // JWT expired or invalid
      if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ success: false, message: 'Token expired, please login again' });
      }
      if (error.name === 'JsonWebTokenError') {
         return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      next(error); // Pass unexpected errors to central error handler
   }
};

exports.admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, no user found' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized, admin access required' });
  }

  next();
};
