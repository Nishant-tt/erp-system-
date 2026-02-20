// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const Session = require("../models/Session");
const config = require("../config/config");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, config.jwt.secret);

    const session = await Session.findOne({ token, isActive: true });
    if (!session) return res.status(401).json({ message: "Session expired" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};