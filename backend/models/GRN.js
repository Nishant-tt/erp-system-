const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    orderedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true },
    acceptedQuantity: { type: Number, default: 0 }, // auto: received - rejected (clamped)
    rejectedQuantity: { type: Number, default: 0 },
    unit: { type: String },
    unitCost: { type: Number, required: true }
});

const grnSchema = new mongoose.Schema(
    {
        grnNumber: { type: String, unique: true },
        poReference: { type: mongoose.Schema.Types.ObjectId, ref: "PO", required: true },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
        items: [grnItemSchema],
        receivedDate: { type: Date, default: Date.now },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        vehicleNumber: { type: String },
        billNumber: { type: String },
        billDate: { type: Date },
        warehouseLocation: { type: String, default: "" },
        inspectionStatus: { type: String, enum: ["PENDING", "PASSED", "FAILED"], default: "PENDING" },
        remarks: { type: String },
        verificationStatus: {
            type: String,
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            default: "PENDING"
        },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: { type: Date },
        verificationComments: { type: String },
        status: {
            type: String,
            enum: ["COMPLETED", "CANCELLED"],
            default: "COMPLETED"
        }
    },
    { timestamps: true }
);

grnSchema.pre("save", async function () {
    if (!this.grnNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.grnNumber = `GRN-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("GRN", grnSchema);
