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
