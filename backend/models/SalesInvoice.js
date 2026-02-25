const mongoose = require("mongoose");

const salesInvoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: { type: String, unique: true },
        soReference: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder" },
        dnReference: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryNote" },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        items: [{
            item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            taxAmount: { type: Number, default: 0 },
            total: { type: Number, required: true }
        }],
        subtotal: { type: Number, required: true },
        taxTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
        amountPaid: { type: Number, default: 0 },
        balanceAmount: { type: Number, required: true },
        invoiceDate: { type: Date, default: Date.now },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ["UNPAID", "PARTIALLY_PAID", "PAID", "CANCELLED"],
            default: "UNPAID"
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

salesInvoiceSchema.pre("save", async function () {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.invoiceNumber = `SINV-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
    this.balanceAmount = this.grandTotal - this.amountPaid;
});

module.exports = mongoose.model("SalesInvoice", salesInvoiceSchema);
