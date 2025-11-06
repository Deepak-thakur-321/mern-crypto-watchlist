const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
   {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      symbol: { type: String, required: true },
      priceAlert: { type: Number }, // optional
   },
   { timestamps: true } // createdAt, updatedAt auto
);

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
