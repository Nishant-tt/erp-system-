// models/Role.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // admin, manager, user
    permissions: [{ type: String }], // e.g. ["USER_CREATE", "USER_DELETE"]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);