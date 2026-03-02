// utils/jwt.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");
// console.log("SECRET:", process.env.JWT_SECRET);
exports.generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expire });
};