const { validationResult } = require('express-validator');
const WatchlistItem = require('../models/WatchlistItem');

//  GET all watchlist items for a user 
exports.getWatchlist = async (req, res, next) => {
   try {
      const items = await WatchlistItem.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: items.length, items });
   } catch (error) {
      next(error);
   }
};

//  CREATE a new watchlist item 
exports.createWatchlistItem = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, symbol, priceAlert } = req.body;

      const newItem = await WatchlistItem.create({
         user: req.user.id,
         name,
         symbol,
         priceAlert,
      });

      res.status(201).json({ success: true, item: newItem });
   } catch (error) {
      next(error);
   }
};

//  UPDATE a watchlist item 
exports.updateWatchlistItem = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
      }

      const item = await WatchlistItem.findById(req.params.id);

      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      if (item.user.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Concise update logic
      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.symbol !== undefined) updates.symbol = req.body.symbol;
      if (req.body.priceAlert !== undefined) updates.priceAlert = req.body.priceAlert;

      Object.assign(item, updates);
      const updatedItem = await item.save();

      res.status(200).json({ success: true, item: updatedItem });
   } catch (error) {
      next(error); 
   }
};

//  DELETE a watchlist item 
exports.deleteWatchlistItem = async (req, res, next) => {
   try {
      const item = await WatchlistItem.findById(req.params.id);

      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      if (item.user.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      await item.deleteOne();

      res.status(200).json({ success: true, message: 'Item removed', id: req.params.id });
   } catch (error) {
      next(error); 
   }
};
