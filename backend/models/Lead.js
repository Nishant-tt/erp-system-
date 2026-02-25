const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        leadNumber: { type: String, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String },
        companyName: { type: String },
        email: { type: String },
        phone: { type: String },
        source: {
            type: String,
            enum: ["WEB", "REFERRAL", "EXHIBITION", "COLD_CALL", "OTHER"],
            default: "OTHER"
        },
        status: {
            type: String,
            enum: ["NEW", "CONTACTED", "QUALIFIED", "LOST"],
            default: "NEW"
        },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        requirements: { type: String },
        notes: { type: String }
    },
    { timestamps: true }
);

leadSchema.pre("save", async function () {
    if (!this.leadNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.leadNumber = `LD-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("Lead", leadSchema);
