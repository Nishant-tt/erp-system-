const mongoose = require("mongoose");

const deliveryNoteSchema = new mongoose.Schema(
    {
        dnNumber: { type: String, unique: true },
        soReference: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder", required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        items: [{
            item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
            shippedQuantity: { type: Number, required: true },
            unit: { type: String }
        }],
        deliveryDate: { type: Date, default: Date.now },
        deliveredBy: { type: String },
        vehicleNumber: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "DELIVERED", "CANCELLED"],
            default: "DELIVERED"
        },
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

deliveryNoteSchema.pre("save", async function () {
    if (!this.dnNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.dnNumber = `DN-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("DeliveryNote", deliveryNoteSchema);
