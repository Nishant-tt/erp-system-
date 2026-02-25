const mongoose = require("mongoose");

const financialYearSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g. "FY 2023-24"
        code: { type: String, required: true, unique: true }, // e.g. "FY24"
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: false },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FinancialYear", financialYearSchema);
