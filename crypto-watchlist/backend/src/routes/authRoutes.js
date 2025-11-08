const express = require("express");
const { body } = require("express-validator");
const {
   registerUser,
   loginUser,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();


router.post(
   "/register",
   authLimiter,
   [
      body("name").notEmpty().withMessage("Name is required"),
      body("email").isEmail().withMessage("Valid email is required"),
      body("password")
         .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
         .matches(/\d/).withMessage("Password must contain a number")
         .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter"),
   ],
   registerUser
);

router.post(
   "/login",
   authLimiter,
   [
      body("email").isEmail().withMessage("Valid email is required"),
      body("password").notEmpty().withMessage("Password is required"),
   ],
   loginUser
);

router.post("/logout", (req, res) => {
   res.clearCookie("token");
   return res.status(200).json({ success: true, message: "Logged out successfully" });
});


module.exports = router;
