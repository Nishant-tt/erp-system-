const mongoose = require("mongoose");

const journalItemSchema = new mongoose.Schema({
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    memo: { type: String }
});

const journalEntrySchema = new mongoose.Schema(
    {
        entryNumber: { type: String, required: true, unique: true },
        date: { type: Date, default: Date.now },
        reference: { type: String }, // Invoice #, Receipt #
        description: { type: String },
        status: {
            type: String,
            enum: ["Draft", "Posted", "Cancelled"],
            default: "Posted"
        },
        items: [journalItemSchema],
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        financialYear: { type: mongoose.Schema.Types.ObjectId, ref: "FinancialYear", required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

// Middleware to ensure Debits = Credits
journalEntrySchema.pre("save", function (next) {
    const totalDebit = this.items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = this.items.reduce((sum, item) => sum + item.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
        return next(new Error("Total Debits must equal Total Credits"));
    }
    next();
});

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
