const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
    {
        soNumber: { type: String, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        quotationReference: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
        items: [{
            item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            taxRate: { type: Number, default: 18 },
            total: { type: Number, required: true },
            shippedQuantity: { type: Number, default: 0 }
        }],
        subtotal: { type: Number, required: true },
        taxTotal: { type: Number, required: true },
        grandTotal: { type: Number, required: true },
        status: {
            type: String,
            enum: ["DRAFT", "OPEN", "PARTIALLY_SHIPPED", "SHIPPED", "INVOICED", "CLOSED", "CANCELLED"],
            default: "OPEN"
        },
        orderDate: { type: Date, default: Date.now },
        expectedDeliveryDate: { type: Date },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

salesOrderSchema.pre("save", async function () {
    if (!this.soNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.soNumber = `SO-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("SalesOrder", salesOrderSchema);
