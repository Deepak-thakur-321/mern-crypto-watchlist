const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Cookie options helper
const getCookieOptions = () => {
   const isProduction = process.env.NODE_ENV === "production";

   return {
      httpOnly: true,
      secure: false, 
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
   };
};

// ✅ REGISTER USER
exports.registerUser = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
         });
      }

      const { name, email, password } = req.body;

      // Check existing user
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
         return res.status(400).json({
            success: false,
            message: "Email already registered"
         });
      }

      // Create user
      const user = await User.create({
         name,
         email: email.toLowerCase(),
         password
      });

      // Generate token
      const token = jwt.sign(
         { id: user._id },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
      );

      // Set cookie
      const cookieOptions = getCookieOptions();
      res.cookie("token", token, cookieOptions);

      console.log("✅ REGISTRATION SUCCESS");
      console.log("User:", user.email);
      console.log("Cookie Options:", cookieOptions);

      return res.status(201).json({
         success: true,
         message: "Registration successful",
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
      });
   } catch (error) {
      console.error("❌ Registration error:", error);
      return res.status(500).json({
         success: false,
         message: error.message || "Registration failed"
      });
   }
};

// ✅ LOGIN USER - FIXED matchPassword
exports.loginUser = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
         });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

      if (!user) {
         console.log("❌ User not found:", email);
         return res.status(401).json({
            success: false,
            message: "Invalid email or password"
         });
      }

      const isPasswordCorrect = await user.matchPassword(password);

      if (!isPasswordCorrect) {
         console.log("❌ Password incorrect for:", email);
         return res.status(401).json({
            success: false,
            message: "Invalid email or password"
         });
      }

      const token = jwt.sign(
         { id: user._id },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
      );

      const cookieOptions = getCookieOptions();

      // ⭐ Set cookie
      res.cookie("token", token, cookieOptions);

      // ⭐ Debug: Check if header is set
      console.log("✅ LOGIN SUCCESS");
      console.log("User:", user.email);
      console.log("Cookie Options:", cookieOptions);
      console.log("Response Headers:", res.getHeaders()); // ⭐ NEW

      return res.status(200).json({
         success: true,
         message: "Login successful",
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
      });
   } catch (error) {
      console.error("❌ LOGIN ERROR:", error);
      return res.status(500).json({
         success: false,
         message: error.message || "Login failed"
      });
   }
};

// ✅ LOGOUT USER
exports.logoutUser = (req, res) => {
   try {
      res.cookie("token", "", {
         httpOnly: true,
         expires: new Date(0),
         path: "/",
      });

      console.log("✅ LOGOUT SUCCESS");

      return res.status(200).json({
         success: true,
         message: "Logged out successfully",
      });
   } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
         success: false,
         message: "Logout failed"
      });
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