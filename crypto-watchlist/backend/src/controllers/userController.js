const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};


exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};


exports.updateProfile = async (req, res, next) => {
  try {
    // Validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map(e => e.msg).join(', '));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User account deleted' });
  } catch (error) {
    next(error);
  }
};
