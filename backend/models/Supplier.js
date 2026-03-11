const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        code: { type: String, trim: true, default: "" }, // Vendor Code
        name: { type: String, required: true },
        tagline: { type: String },
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

module.exports = mongoose.model("Supplier", supplierSchema);
