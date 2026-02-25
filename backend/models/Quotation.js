const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
    {
        quotationNumber: { type: String, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        opportunityReference: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity" },
        items: [{
            item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            taxRate: { type: Number, default: 18 },
            total: { type: Number, required: true }
        }],
        subtotal: { type: Number, required: true },
        taxTotal: { type: Number, required: true },
        grandTotal: { type: Number, required: true },
        validUntil: { type: Date },
        status: {
            type: String,
            enum: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"],
            default: "DRAFT"
        },
        terms: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

quotationSchema.pre("save", async function () {
    if (!this.quotationNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.quotationNumber = `QT-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("Quotation", quotationSchema);
