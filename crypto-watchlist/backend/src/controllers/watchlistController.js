const WatchlistItem = require('../models/WatchlistItem');

exports.getWatchlist = async (req, res, next) => {
   try {
      const items = await WatchlistItem.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: items.length, items });
   } catch (error) {
      next(error);
   }
};

exports.createWatchlistItem = async (req, res, next) => {
   try {
      const { name, symbol, priceAlert } = req.body;

      if (!name || !symbol) {
         return res.status(400).json({ success: false, message: 'Name and symbol are required' });
      }

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


exports.updateWatchlistItem = async (req, res, next) => {
   try {
      const item = await WatchlistItem.findById(req.params.id);

      if (!item) {
         return res.status(404).json({ success: false, message: 'Item not found' });
      }

      if (item.user.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const { name, symbol, priceAlert } = req.body;

      item.name = name || item.name;
      item.symbol = symbol || item.symbol;
      item.priceAlert = priceAlert !== undefined ? priceAlert : item.priceAlert;

      const updatedItem = await item.save();

      res.status(200).json({ success: true, item: updatedItem });
   } catch (error) {
      next(error);
   }
};

exports.deleteWatchlistItem = async (req, res, next) => {
   try {
      const item = await WatchlistItem.findById(req.params.id);

      if (!item) {
         return res.status(404).json({ success: false, message: 'Item not found' });
      }

      if (item.user.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      await item.deleteOne();

      res.status(200).json({ success: true, message: 'Item removed' });
   } catch (error) {
      next(error);
   }
};
