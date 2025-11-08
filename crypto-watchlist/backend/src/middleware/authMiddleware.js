const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
   try {
      let token;

      if (req.cookies?.token) token = req.cookies.token;

      else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
         return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
         return res.status(401).json({ success: false, message: "User no longer exists" });
      }
      next();
   } catch (error) {
      if (error.name === "TokenExpiredError") {
         return res.status(401).json({ success: false, message: "Token expired, please login again" });
      }
      if (error.name === "JsonWebTokenError") {
         return res.status(401).json({ success: false, message: "Invalid token" });
      }
      console.error("Auth middleware unexpected error:", error);
      return res.status(500).json({ success: false, message: "Authentication error" });
   }
};

exports.admin = (req, res, next) => {
   if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });
   if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
   next();
};

exports.user = (req, res, next) => {
   if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });
   if (req.user.role !== "user") return res.status(403).json({ success: false, message: "User access required" });
   next();
};