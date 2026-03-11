const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, required: true }, // lucide icon name
    path: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Optional RBAC: if set, only these roles will see the module in sidebar.
    // Empty/missing => visible to all authenticated users.
    allowedRoles: [{ type: String, default: [] }],
}, { timestamps: true });

module.exports = mongoose.model("Module", moduleSchema);
