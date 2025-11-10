const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT Helper
const generateToken = (userId) => {
   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ PRODUCTION-READY Cookie Options
const getCookieOptions = () => {
   return {
      httpOnly: true,
      secure: false, 
      sameSite: "Lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
   };
};

// ✅ Register User - FIXED
exports.registerUser = async (req, res, next) => {
   try {
      // Validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
         });
      }

      const { name, email, password } = req.body;

      if (!name || !email || !password) {
         return res.status(400).json({
            success: false,
            message: "All fields are required"
         });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
         return res.status(400).json({
            success: false,
            message: "Email already registered"
         });
      }

      // Create new user
      const user = await User.create({
         name,
         email: email.toLowerCase(),
         password
      });

      // Generate token
      const token = generateToken(user._id);


      const cookieOptions = getCookieOptions();

      res
         .cookie("token", token, cookieOptions)
         .status(201)
         .json({
            success: true,
            message: "Registration successful",
            user: {
               id: user._id,
               name: user.name,
               email: user.email,
               role: user.role || "user"
            },
         });
   } catch (err) {
      console.error("Registration error:", err);
      next(err);
   }
};

// ✅ Login User - FIXED
exports.loginUser = async (req, res, next) => {
   try {
      // Validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
         });
      }

      const { email, password } = req.body;

      if (!email || !password) {
         return res.status(400).json({
            success: false,
            message: "Email and password required"
         });
      }

      // Find user with password
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

      if (!user) {
         return res.status(401).json({
            success: false,
            message: "Invalid credentials"
         });
      }

      // Verify password
      const isPasswordValid = await user.matchPassword(password);
      if (!isPasswordValid) {
         return res.status(401).json({
            success: false,
            message: "Invalid credentials"
         });
      }

      // Generate token
      const token = generateToken(user._id);

      // ✅ Set cookie with production-ready options
      const cookieOptions = getCookieOptions();

      res
         .cookie("token", token, cookieOptions)
         .status(200)
         .json({
            success: true,
            message: "Login successful",
            user: {
               id: user._id,
               name: user.name,
               email: user.email,
               role: user.role || "user",
            },
         });
   } catch (error) {
      console.error("Login error:", error);
      next(error);
   }
};

// ✅ Logout User - FIXED
exports.logoutUser = (req, res, next) => {
   try {
      const cookieOptions = getCookieOptions();

      res
         .cookie("token", "", {
            ...cookieOptions,
            maxAge: 1, // Expire immediately
         })
         .status(200)
         .json({
            success: true,
            message: "Logged out successfully"
         });
   } catch (error) {
      console.error("Logout error:", error);
      next(error);
   }
};

// ✅ Get Profile
exports.getProfile = async (req, res, next) => {
   try {
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      res.status(200).json({
         success: true,
         user
      });
   } catch (error) {
      console.error("Get profile error:", error);
      next(error);
   }
};