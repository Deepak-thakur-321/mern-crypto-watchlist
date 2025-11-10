const express = require("express");
const { applyReferral, getReferralData } = require("../controllers/referralController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/referral/apply
router.post("/apply", protect, applyReferral);
router.get("/", protect, getReferralData);

module.exports = router;
