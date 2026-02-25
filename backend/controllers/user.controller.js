// controllers/user.controller.js
const User = require("../models/User");
const bcrypt = require("bcrypt");

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
  let query = {};

  // Super Admin sees all users
  // Admin (Module Admin) only sees users in their department
  if (req.user.role === 'Admin') {
    query = { department: req.user.department };
  } else if (req.user.role !== 'Super Admin') {
    // Other roles shouldn't really be calling this, but safety first
    query = { _id: req.user.id };
  }

  const users = await User.find(query).populate("role").populate("department");
  res.json(users);
};

exports.createUser = async (req, res) => {
  try {
    const userData = { ...req.body };

    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Module Admin can only create users in their own department
    if (req.user.role === 'Admin') {
      userData.department = req.user.department;
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    let message = "Error creating user";
    if (error.code === 11000) message = "Email already exists";
    else if (error.errors) message = Object.values(error.errors).map(e => e.message).join(", ");
    else message = error.message;

    res.status(400).json({ message, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userData = { ...req.body };
    if (!userData.role) delete userData.role;
    if (!userData.department) delete userData.department;
    if (!userData.team) delete userData.team;

    // Hash password if it's being updated
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    } else {
      delete userData.password;
    }

    const query = { _id: req.params.id };
    if (req.user.role === 'Admin') {
      query.department = req.user.department;
    }

    const user = await User.findOneAndUpdate(query, userData, { new: true }).populate("role").populate("department");
    if (!user) return res.status(404).json({ message: "User not found or access denied" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Error updating user", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'Admin') {
      query.department = req.user.department;
    }

    const user = await User.findOneAndDelete(query);
    if (!user) return res.status(404).json({ message: "User not found or access denied" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
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
