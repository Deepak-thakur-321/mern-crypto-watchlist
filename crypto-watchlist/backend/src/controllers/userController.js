const User = require("../models/User");
const { validationResult } = require("express-validator");

exports.getProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(404).json({ success: false, message: "User not found" });

    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    };

    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, email, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    const updated = await user.save();
    res.status(200).json({ success: true, user: { id: updated._id, name: updated.name, email: updated.email, role: updated.role } });
  } catch (err) {
    next(err);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
