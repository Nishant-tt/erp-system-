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
    department: user.department,
  });

  res.json({ token, user });
};

exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // In a real application, you would generate a reset token and send an email here.
    // For this task, we will just return a success message.
    console.log(`Password reset requested for: ${email}`);

    res.json({ message: "Password reset link has been sent to your email (Mocked)" });
  } catch (error) {
    res.status(500).json({ message: "Error processing forgot password request", error: error.message });
  }
};
