const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, required: true }, // lucide icon name
    path: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Module", moduleSchema);
