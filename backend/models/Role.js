// models/Role.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // admin, manager, user
    permissions: [{ type: String, default: [] }], // e.g. ["sales.view", "sales.approve"]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);