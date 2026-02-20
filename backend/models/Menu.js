const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);
