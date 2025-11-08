const rateLimit = require("express-rate-limit");

// General limiter
const generalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 min
   max: 200,
   standardHeaders: true,
   legacyHeaders: false,
   handler: (req, res) => {
      res.status(429).json({
         success: false,
         message: "Too many requests, please try again after 15 minutes.",
      });
   },
});

// Stricter limiter for auth routes (login/register)
const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 min
   max: 20,
   standardHeaders: true,
   legacyHeaders: false,
   handler: (req, res) => {
      res.status(429).json({
         success: false,
         message: "Too many login/register attempts. Try again later.",
      });
   },
});

module.exports = { generalLimiter, authLimiter };
