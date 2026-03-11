const mongoose = require("mongoose");

const itemMasterSchema = new mongoose.Schema(
    {
        itemCode: { type: String, required: true, unique: true, trim: true },
        itemName: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        category: { type: String, required: true },
        subCategory: { type: String, default: "" },
        uom: { type: String, required: true }, // Unit of Measure: KG, PCS, LTR, MTR, etc.
        hsn: { type: String, default: "" },     // HSN / SAC Code
        gstRate: { type: Number, default: 0 },  // GST % e.g. 18
        standardRate: { type: Number, default: 0 },
        minOrderQty: { type: Number, default: 1 },
        leadTimeDays: { type: Number, default: 0 },
        preferredSupplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
        stockOnHand: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ItemMaster", itemMasterSchema);
