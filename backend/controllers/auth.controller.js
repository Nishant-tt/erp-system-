const User = require("../models/User");
const Role = require("../models/Role");
require("../models/Company");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const config = require("../config/config");

const FinancialYear = require("../models/FinancialYear");

exports.login = async (req, res) => {
  const { email, password, financialYearId } = req.body;

  if (!financialYearId) {
    return res.status(400).json({ message: "Please select a financial year" });
  }

  const user = await User.findOne({ email }).populate("role");
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const Company = require("../models/Company");
  const selectedFY = await FinancialYear.findById(financialYearId);
  if (!selectedFY) return res.status(404).json({ message: "Financial Year not found" });

  const companyDetails = await Company.findById(selectedFY.company);

  // Only Super Admin can login into inactive financial years
  if (!selectedFY.isActive && user.role.name !== 'Super Admin') {
    return res.status(403).json({
      message: "Access Denied: Only Super Admins can login to a closed/previous financial year."
    });
  }

  const token = generateToken({
    id: user._id,
    role: user.role.name,
    department: user.department,
    financialYear: selectedFY._id
  });

  res.json({
    token,
    user,
    financialYear: {
      id: selectedFY._id,
      name: selectedFY.name,
      code: selectedFY.code
    },
    company: {
      id: companyDetails?._id,
      name: companyDetails?.name
    }
  });
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
