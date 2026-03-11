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
            description: { type: String, default: "" }, // Item Description for reports
            quantity: { type: Number, required: true },
            unitCost: { type: Number, required: true },
            taxAmount: { type: Number, default: 0 },
            totalCost: { type: Number, required: true }
        }],
        subtotal: { type: Number, required: true },
        taxTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },

        // 3-way match + approval workflow (separate from payment status)
        matchStatus: {
            type: String,
            enum: ["PENDING", "MATCHED", "MISMATCHED"],
            default: "PENDING"
        },
        matchErrors: [{ type: String, default: [] }],
        matchNotes: { type: String, default: "" },
        approvalStatus: {
            type: String,
            enum: ["PENDING_APPROVAL", "APPROVED", "REJECTED", "ON_HOLD"],
            default: "PENDING_APPROVAL"
        },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date },
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rejectedAt: { type: Date },
        approvalComments: { type: String, default: "" },

        // Finance posting status (Journal Entry creation)
        financePosted: { type: Boolean, default: false },
        financePostedAt: { type: Date },
        financeReference: { type: String, default: "" },

        amountPaid: { type: Number, default: 0 },
        balanceAmount: { type: Number, required: true },
        invoiceDate: { type: Date, required: true },
        paymentTerms: { type: String, default: "" },
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
