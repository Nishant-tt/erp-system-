const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
        lead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
