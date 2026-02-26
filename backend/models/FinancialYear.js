const mongoose = require("mongoose");

const financialYearSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: false },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }
    },
    { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("FinancialYear", financialYearSchema);
