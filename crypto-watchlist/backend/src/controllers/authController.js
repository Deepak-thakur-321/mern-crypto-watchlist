const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT Helper
const generateToken = (userId) => {
   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Cookie Options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Register User
exports.registerUser = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, referralCode } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
         return res.status(400).json({ success: false, message: "Email already registered" });
      }

      const newUser = new User({ name, email, password });

      // Referral logic (optional)
      if (referralCode) {
         const referrer = await User.findOne({ referralCode: referralCode.trim() });
         if (referrer) {
            newUser.referredBy = referrer._id;
            newUser.hasReferral = true;
            newUser.perksUnlocked.push("Signup Bonus");
            referrer.perksUnlocked.push("Referral Bonus");
            await referrer.save();
         }
      }

      await newUser.save();

      const token = generateToken(newUser._id);

      res
         .cookie("token", token, cookieOptions)
         .status(201)
         .json({
            success: true,
            message: "Registration successful",
            user: {
               id: newUser._id,
               name: newUser.name,
               email: newUser.email,
            },
         });
   } catch (error) {
      next(error);
   }
};

// Login User
exports.loginUser = async (req, res, next) => {
   try {
      const { email, password } = req.body;
      if (!email || !password)
         return res.status(400).json({ success: false, message: "Email and password required" });

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.matchPassword(password))) {
         return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const token = generateToken(user._id);

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
               role: user.role,
            },
         });
   } catch (error) {
      next(error);
   }
};

// Logout User
exports.logoutUser = (req, res, next) => {
   try {
      res.cookie("token", "", {
         ...cookieOptions,
         maxAge: 1, // instantly expire
      });
      res.status(200).json({ success: true, message: "Logged out successfully" });
   } catch (error) {
      next(error);
   }
};

// Get Profile
exports.getProfile = async (req, res, next) => {
   try {
      const user = await User.findById(req.user.id).select("-password");
      res.status(200).json({ success: true, user });
   } catch (error) {
      next(error);
   }
};
