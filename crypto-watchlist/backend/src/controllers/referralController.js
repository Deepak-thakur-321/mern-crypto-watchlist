const User = require("../models/User");

exports.applyReferral = async (req, res) => {
   try {
      const { code } = req.body;
      const userId = req.user?.id;

      if (!code)
         return res
            .status(400)
            .json({ success: false, message: "Referral code is required." });

      if (!userId)
         return res
            .status(401)
            .json({ success: false, message: "Unauthorized: No user found." });

    
      const referringUser = await User.findOne({ referralCode: code });
      if (!referringUser)
         return res
            .status(404)
            .json({ success: false, message: "Invalid referral code." });

   
      if (referringUser._id.toString() === userId.toString()) {
         return res.status(400).json({
            success: false,
            message: "You cannot use your own referral code.",
         });
      }

    
      const currentUser = await User.findById(userId);
      if (!currentUser)
         return res
            .status(404)
            .json({ success: false, message: "User not found." });

    
      if (currentUser.hasReferral) {
         return res.status(400).json({
            success: false,
            message: "Referral code already applied.",
         });
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
   } catch (error) {
      console.error("Referral apply error:", error.message);
      res.status(500).json({
         success: false,
         message: "Server error while applying referral.",
      });
   }
};
