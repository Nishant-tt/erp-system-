const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    receivedQuantity: { type: Number, default: 0 },
    unit: { type: String },
    unitCost: { type: Number, required: true },
    totalCost: { type: Number, required: true }
});

const poSchema = new mongoose.Schema(
    {
        poNumber: { type: String, unique: true },
        prReference: { type: mongoose.Schema.Types.ObjectId, ref: "PR" },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
        items: [poItemSchema],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["DRAFT", "OPEN", "PARTIALLY_RECEIVED", "RECEIVED", "CLOSED", "CANCELLED"],
            default: "DRAFT"
        },
        orderDate: { type: Date, default: Date.now },
        expectedDeliveryDate: { type: Date },
        terms: { type: String },
        notes: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

poSchema.pre("save", async function () {
    if (!this.poNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.poNumber = `PO-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("PO", poSchema);
