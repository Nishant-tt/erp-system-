const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        type: {
            type: String,
            required: true,
            enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"]
        },
        category: { type: String }, // e.g., "Cash", "Accounts Receivable", "Fixed Asset"
        parent: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
        description: { type: String },
        isActive: { type: Boolean, default: true },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
