const express = require("express");
const { body } = require("express-validator");
const { getUsers, getProfile, updateProfile, deleteProfile } = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, admin, getUsers);

router
  .route("/profile")
  .get(protect, getProfile)
  .put(
    protect,
    [
      body("name").optional().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
      body("email").optional().isEmail().withMessage("Email is invalid"),
      body("password").optional().isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    ],
    updateProfile
  )
  .delete(protect, deleteProfile);

module.exports = router;
