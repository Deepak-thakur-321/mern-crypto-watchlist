const rateLimit = require('express-rate-limit');

// General API limiter
const generalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100,
   standardHeaders: true,
   legacyHeaders: false,
   handler: (req, res) => {
      res.status(429).json({ success: false, message: 'Too many requests, please try again after 15 minutes.' });
   }
});

// Auth limiter
const authLimiter = rateLimit({
   windowMs: 10 * 60 * 1000, // 10 minutes
   max: 10,
   standardHeaders: true,
   legacyHeaders: false,
   handler: (req, res) => {
      res.status(429).json({ success: false, message: 'Too many authentication attempts. Please wait 10 minutes.' });
   }
});

module.exports = { generalLimiter, authLimiter };
