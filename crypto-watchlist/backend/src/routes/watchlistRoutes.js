const express = require('express');
const router = express.Router();
const {
   getWatchlist,
   createWatchlistItem,
   updateWatchlistItem,
   deleteWatchlistItem,
} = require('../controllers/watchlistController');

const { protect } = require('../middleware/authMiddleware'); // JWT middleware

// All routes are protected
router.use(protect);

router.route('/')
   .get(getWatchlist)
   .post(createWatchlistItem);

router.route('/:id')
   .put(updateWatchlistItem)
   .delete(deleteWatchlistItem);

module.exports = router;
