// controllers/auth.controller.js
const User = require("../models/User");
const Role = require("../models/Role");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const config = require("../config/config");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("role");
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken({
    id: user._id,
    role: user.role.name,
  });

  const expiresAt = new Date(Date.now() + config.sessionExpireMinutes * 60000);

  await Session.create({ user: user._id, token, expiresAt });

  res.json({ token, user });
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  await Session.updateOne({ token }, { isActive: false });
  res.json({ message: "Logged out successfully" });
};
