const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
   {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true, trim: true },
      symbol: { type: String, required: true, trim: true },
      priceAlert: { type: Number, min: 0 }, 
   },
   { timestamps: true }
);

watchlistItemSchema.index({ user: 1, symbol: 1 }, { unique: true });


module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
