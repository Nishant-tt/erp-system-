const mongoose = require("mongoose");

const pqItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster", required: true },
  description: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: "pcs" },
  unitPrice: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, default: 18, min: 0 },
  taxableValue: { type: Number, required: true, min: 0 },
  gstAmount: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },
});

const procurementQuotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, unique: true }, // Used as RFQ Number in UI
    rfqDate: { type: Date, default: Date.now }, // RFQ Date
    prReference: { type: mongoose.Schema.Types.ObjectId, ref: "PR", required: true },
    suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
    // RFQ header fields
    requestedDeliveryDate: { type: Date }, // Requested Delivery Date
    quotationDueDate: { type: Date }, // Quotation Due Date
    termsConditions: { type: String, default: "" }, // Terms & Conditions
    currency: { type: String, default: "INR" }, // Dropdown in UI
    remarks: { type: String, default: "" },
    items: [pqItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    gstTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "REJECTED"],
      default: "DRAFT",
    },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: { type: Date },
    comments: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

procurementQuotationSchema.pre("validate", function () {
  const items = this.items || [];
  const subtotal = items.reduce((sum, it) => sum + (Number(it.taxableValue) || 0), 0);
  const gstTotal = items.reduce((sum, it) => sum + (Number(it.gstAmount) || 0), 0);
  this.subtotal = subtotal;
  this.gstTotal = gstTotal;
  this.grandTotal = subtotal + gstTotal;
});

procurementQuotationSchema.pre("save", async function () {
  if (!this.quotationNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.quotationNumber = `PQT-${year}-${String(count + 1).padStart(3, "0")}`;
  }
});

module.exports = mongoose.model("ProcurementQuotation", procurementQuotationSchema);
