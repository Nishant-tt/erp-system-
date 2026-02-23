const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gstin: { type: String, unique: true },
        pan: { type: String, unique: true },
        contact: {
            person: { type: String },
            email: { type: String },
            phone: { type: String },
            address: { type: String }
        },
        bank_details: {
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
