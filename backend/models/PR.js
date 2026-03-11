const mongoose = require("mongoose");

const prItemSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "pcs" },
    estimatedUnitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 }
});

const prSchema = new mongoose.Schema(
    {
        prNumber: { type: String, unique: true },
        prDate: { type: Date, default: Date.now },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
        requiredDate: { type: Date },
        budgetCode: { type: String, default: "" }, // Budget Code / Cost Center
        costCenter: { type: String, default: "" },
        priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
        vendorSuggestion: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
        remarks: { type: String, default: "" },
        items: [prItemSchema],
        totalAmount: { type: Number, required: true, default: 0 },
        status: {
            type: String,
            enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"],
            default: "DRAFT"
        },
        approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvalDate: { type: Date },
        comments: { type: String },
        reasonForRejection: { type: String }
    },
    { timestamps: true }
);

// Auto-generate PR Number (e.g., PR-2024-001)
prSchema.pre("save", async function () {
    if (!this.prNumber) {
        const date = new Date();
        const year = date.getFullYear();
        // Use this.constructor for better model access in hooks
        const count = await this.constructor.countDocuments();
        this.prNumber = `PR-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }

    // Recalculate totalAmount from items (GST is handled in quotation/PO stage)
    const subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitCost), 0);
    this.totalAmount = subtotal;
});

module.exports = mongoose.model("PR", prSchema);
