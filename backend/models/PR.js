const mongoose = require("mongoose");

const prItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "pcs" },
    estimatedUnitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 }
});

const prSchema = new mongoose.Schema(
    {
        prNumber: { type: String, unique: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
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
prSchema.pre("save", async function (next) {
    if (!this.prNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await mongoose.model("PR").countDocuments();
        this.prNumber = `PR-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }

    // Recalculate totalAmount from items
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitCost), 0);

    next();
});

module.exports = mongoose.model("PR", prSchema);
