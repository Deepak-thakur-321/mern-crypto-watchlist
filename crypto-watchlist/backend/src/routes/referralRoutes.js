const express = require("express");
const { applyReferral } = require("../controllers/referralController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/referral/apply
router.post("/apply", protect, applyReferral);

module.exports = router;
