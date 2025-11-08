const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
   getWatchlist,
   createWatchlistItem,
   updateWatchlistItem,
   deleteWatchlistItem,
} = require("../controllers/watchlistController");
const { protect } = require("../middleware/authMiddleware");

// Validation rules 
const createValidation = [
   body("name", "Name is required").trim().notEmpty(),
   body("symbol", "Symbol is required").trim().notEmpty(),
   body("priceAlert")
      .optional()
      .isNumeric()
      .withMessage("Price alert must be a number")
      .bail()
      .custom((value) => value >= 0 || Promise.reject("Price alert must be >= 0")),
];

const updateValidation = [
   param("id", "Invalid item ID").isMongoId(),
   body("name").optional().trim().notEmpty(),
   body("symbol").optional().trim().notEmpty(),
   body("priceAlert")
      .optional()
      .isNumeric()
      .withMessage("Price alert must be a number")
      .bail()
      .custom((value) => value >= 0 || Promise.reject("Price alert must be >= 0")),
];

//  Protected Routes 
router.use(protect);

router
   .route("/")
   .get(getWatchlist) 
   .post(createValidation, createWatchlistItem); 

router
   .route("/:id")
   .put(updateValidation, updateWatchlistItem) 
   .delete(deleteWatchlistItem); 
module.exports = router;
