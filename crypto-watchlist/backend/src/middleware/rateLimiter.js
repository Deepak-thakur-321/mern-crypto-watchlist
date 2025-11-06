const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 100, 
   standardHeaders: true,
   legacyHeaders: false,
   message: 'Too many requests, please try again after 15 minutes.',
});

// 2. Strict Auth Limiter (Used only on /api/auth/login and /api/auth/register)
const authLimiter = rateLimit({
   windowMs: 10 * 60 * 1000,
   max: 10,
   standardHeaders: true,
   legacyHeaders: false,
   message: 'Too many authentication attempts. Please wait 10 minutes.',
});

module.exports = {
   generalLimiter,
   authLimiter,
};