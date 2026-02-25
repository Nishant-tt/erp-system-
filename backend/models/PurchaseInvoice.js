const mongoose = require("mongoose");

const purchaseInvoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: { type: String, unique: true }, // Internal Invoice Number
        vendorInvoiceNumber: { type: String, required: true }, // The invoice number from the vendor
        poReference: { type: mongoose.Schema.Types.ObjectId, ref: "PO" },
        grnReference: { type: mongoose.Schema.Types.ObjectId, ref: "GRN" },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
        items: [{
            item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster" },
            quantity: { type: Number, required: true },
            unitCost: { type: Number, required: true },
            taxAmount: { type: Number, default: 0 },
            totalCost: { type: Number, required: true }
        }],
        subtotal: { type: Number, required: true },
        taxTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
        amountPaid: { type: Number, default: 0 },
        balanceAmount: { type: Number, required: true },
        invoiceDate: { type: Date, required: true },
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

purchaseInvoiceSchema.pre("save", async function () {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
    this.balanceAmount = this.grandTotal - this.amountPaid;
});

module.exports = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
