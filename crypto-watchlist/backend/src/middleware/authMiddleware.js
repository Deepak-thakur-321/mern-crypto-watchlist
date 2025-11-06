const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
   let token;

   // Check cookie first
   if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
   }

   // Fallback: Authorization header
   if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
   }

   if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password'); // attach user to request
      next();
   } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
   }
};