// controllers/user.controller.js
const User = require("../models/User");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
exports.getUsers = async (req, res) => {
  const users = await User.find().populate("role");
  res.json(users);
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).populate("role");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
