const mongoose = require("mongoose");

const customerPaymentSchema = new mongoose.Schema(
    {
        paymentNumber: { type: String, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        invoiceReference: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice", required: true },
        amount: { type: Number, required: true },
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: {
            type: String,
            enum: ["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"],
            required: true
        },
        transactionId: { type: String },
        remarks: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "COMPLETED"
        },
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

customerPaymentSchema.pre("save", async function () {
    if (!this.paymentNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.paymentNumber = `CPAY-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("CustomerPayment", customerPaymentSchema);
