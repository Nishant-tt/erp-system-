const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    receivedQuantity: { type: Number, default: 0 },
    unit: { type: String },
    unitCost: { type: Number, required: true },
    totalCost: { type: Number, required: true }, // legacy (pre-GST) line total
    discount: { type: Number, default: 0 }, // line discount amount (pre-tax)
    gstRate: { type: Number, default: 0 },
    taxableValue: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 },
});

const poSchema = new mongoose.Schema(
    {
        poNumber: { type: String, unique: true },
        prReference: { type: mongoose.Schema.Types.ObjectId, ref: "PR" },
        quotationReference: { type: mongoose.Schema.Types.ObjectId, ref: "ProcurementQuotation", default: null },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
        items: [poItemSchema],
        totalAmount: { type: Number, required: true },
        subtotal: { type: Number, default: 0 },
        gstTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },

        // Workflow: approvals (legal commitment) vs logistics status (receipt/closure)
        approvalStatus: {
            type: String,
            enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"],
            default: "DRAFT"
        },
        requiredApprovalRoles: [{ type: String, default: [] }],
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        submittedAt: { type: Date },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date },
        approvalComments: { type: String, default: "" },
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rejectedAt: { type: Date },
        rejectionReason: { type: String, default: "" },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        issuedAt: { type: Date },

        status: {
            type: String,
            enum: ["DRAFT", "OPEN", "PARTIALLY_RECEIVED", "RECEIVED", "CLOSED", "CANCELLED"],
            default: "DRAFT"
        },
        orderDate: { type: Date, default: Date.now },
        expectedDeliveryDate: { type: Date },
        deliveryLocation: { type: String, default: "" },
        paymentTerms: { type: String, default: "" }, // shown as Payment Terms in UI
        terms: { type: String },
        shippingMethod: { type: String, default: "" },
        costCenter: { type: String, default: "" },
        notes: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

poSchema.pre("validate", function () {
    const items = this.items || [];

    // Normalize line calculations (supports discount as pre-tax amount)
    for (const it of items) {
        const qty = Number(it.quantity) || 0;
        const unitCost = Number(it.unitCost) || 0;
        const discount = Math.max(0, Number(it.discount) || 0);
        const gstRate = Math.max(0, Number(it.gstRate) || 0);

        const rawTaxable = qty * unitCost - discount;
        const taxableValue = Math.max(0, Number.isFinite(it.taxableValue) && it.taxableValue > 0 ? Number(it.taxableValue) : rawTaxable);
        const gstAmount = Number.isFinite(it.gstAmount) && it.gstAmount > 0 ? Number(it.gstAmount) : (taxableValue * (gstRate / 100));
        const lineTotal = Number.isFinite(it.lineTotal) && it.lineTotal > 0 ? Number(it.lineTotal) : (taxableValue + gstAmount);

        it.taxableValue = taxableValue;
        it.gstAmount = gstAmount;
        it.lineTotal = lineTotal;
        it.totalCost = Number.isFinite(it.totalCost) && it.totalCost > 0 ? Number(it.totalCost) : taxableValue; // legacy
    }

    const subtotal = items.reduce((sum, it) => sum + (Number(it.taxableValue) || 0), 0);
    const gstTotal = items.reduce((sum, it) => sum + (Number(it.gstAmount) || 0), 0);
    const grandTotal = subtotal + gstTotal;
    this.subtotal = subtotal;
    this.gstTotal = gstTotal;
    this.grandTotal = grandTotal;

    // Keep legacy field in sync
    if (!Number.isFinite(this.totalAmount) || this.totalAmount <= 0) {
        this.totalAmount = grandTotal;
    }

    // Backward-compatible defaulting
    if (!this.paymentTerms && this.terms) {
        this.paymentTerms = this.terms;
    }
});

poSchema.pre("save", async function () {
    if (!this.poNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.poNumber = `PO-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("PO", poSchema);
