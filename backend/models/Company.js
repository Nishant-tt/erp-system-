const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        tagline: { type: String },
        logo: { type: String }, // Path to logo image
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
            country: { type: String, default: "India" }
        },
        contact: {
            email: { type: String },
            phone: { type: String },
            website: { type: String }
        },
        taxInfo: {
            gstin: { type: String },
            pan: { type: String },
            cin: { type: String }
        },
        bankDetails: {
            bankName: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String },
            branch: { type: String }
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
