// models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
