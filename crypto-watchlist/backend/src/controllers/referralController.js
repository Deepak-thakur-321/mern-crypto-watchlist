const asyncHandler = require('express-async-handler');
const User = require("../models/User"); 

const getReferralData = asyncHandler(async (req, res) => {
   const userId = req.user.id;

   const currentUser = await User.findById(userId).select('referralCode perksUnlocked name email');

   if (!currentUser) {
      res.status(404);
      throw new Error("User not found.");
   }

   const referralsCount = await User.countDocuments({ referredBy: userId });

   res.status(200).json({
      success: true,
      referralCode: currentUser.referralCode,
      referralsCount: referralsCount,
      perksUnlocked: currentUser.perksUnlocked || [],
      user: {
         name: currentUser.name,
         email: currentUser.email,
      }
   });
});


const applyReferral = asyncHandler(async (req, res) => {
   const { code } = req.body;
   const userId = req.user.id;

   if (!code) {
      res.status(400);
      throw new Error("Referral code is required.");
   }

   
   if (!userId) {
      res.status(401);
      throw new Error("Unauthorized: No user found.");
   }

   
   const referringUser = await User.findOne({ referralCode: code });
   if (!referringUser) {
      res.status(404);
      throw new Error("Invalid referral code.");
   }

   if (referringUser._id.toString() === userId.toString()) {
      res.status(400);
      throw new Error("You cannot use your own referral code.");
   }

   const currentUser = await User.findById(userId);
   if (!currentUser) {
      res.status(404);
      throw new Error("User not found.");
   }

   if (currentUser.hasReferral) {
      res.status(400);
      throw new Error("Referral code already applied.");
   }

   currentUser.referredBy = referringUser._id;
   currentUser.hasReferral = true;
   currentUser.perksUnlocked = [
      ...new Set([
         ...(currentUser.perksUnlocked || []),
         "Extended Watchlist Limit",
         "Advanced Price Alerts",
         "Ad-Free Dashboard",
      ]),
   ];

   await currentUser.save();


   referringUser.perksUnlocked = [
      ...new Set([
         ...(referringUser.perksUnlocked || []),
         "Referral Bonus Credit",
         "Early Access to Features",
      ]),
   ];
   await referringUser.save();

   // Success response
   res.status(200).json({
      success: true,
      message: "Referral applied successfully!",
      perksUnlocked: currentUser.perksUnlocked,
      user: {
         name: currentUser.name,
         email: currentUser.email,
         hasReferral: currentUser.hasReferral,
         perksUnlocked: currentUser.perksUnlocked,
      },
   });
});


module.exports = {
   applyReferral,
   getReferralData,
};