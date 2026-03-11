const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Optional RBAC: if set, only these roles will see the menu in sidebar.
    // Empty/missing => visible to all authenticated users.
    allowedRoles: [{ type: String, default: [] }],
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);
