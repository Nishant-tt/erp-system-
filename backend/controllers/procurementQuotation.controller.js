const ProcurementQuotation = require("../models/ProcurementQuotation");
const PR = require("../models/PR");
const ItemMaster = require("../models/ItemMaster");

const calcLine = ({ quantity, unitPrice, gstRate }) => {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  const rate = Number(gstRate) || 0;

  const taxableValue = qty * price;
  const gstAmount = taxableValue * (rate / 100);
  const lineTotal = taxableValue + gstAmount;

  return { taxableValue, gstAmount, lineTotal };
};

exports.getQuotations = async (req, res) => {
  const q = await ProcurementQuotation.find()
    .populate("prReference", "prNumber status")
    .populate("suppliers", "name taxInfo.gstin")
    .populate("createdBy", "name")
    .populate("approver", "name")
    .sort({ createdAt: -1 });
  res.json(q);
};

exports.getQuotationById = async (req, res) => {
  const q = await ProcurementQuotation.findById(req.params.id)
    .populate({
      path: "prReference",
      populate: [
        { path: "requestedBy", select: "name email" },
        { path: "department", select: "name code" },
      ],
    })
    .populate("items.item")
    .populate("suppliers")
    .populate("createdBy", "name")
    .populate("approver", "name");

  if (!q) return res.status(404).json({ message: "Quotation not found" });
  res.json(q);
};

exports.createFromPR = async (req, res) => {
  const pr = await PR.findById(req.params.prId).populate("items.item");
  if (!pr) return res.status(404).json({ message: "PR not found" });
  if (pr.status !== "APPROVED") {
    return res.status(400).json({ message: "Quotation can only be created from an APPROVED PR" });
  }

  // Suggested suppliers: union of preferred suppliers on items (if available).
  const preferredSupplierIds = new Set();
  for (const it of pr.items || []) {
    const preferred = it?.item?.preferredSupplier;
    if (preferred) preferredSupplierIds.add(String(preferred));
  }

  const suppliers = Array.isArray(req.body?.suppliers) && req.body.suppliers.length > 0
    ? req.body.suppliers
    : [...preferredSupplierIds];

  // Build quotation items:
  const items = await Promise.all(
    (pr.items || []).map(async (it) => {
      const itemDoc = it.item?._id ? it.item : await ItemMaster.findById(it.item);
      const gstRate = Number(itemDoc?.gstRate) || 0;
      const unitPrice = Number(it.estimatedUnitCost) || 0;
      const quantity = Number(it.quantity) || 0;
      const { taxableValue, gstAmount, lineTotal } = calcLine({ quantity, unitPrice, gstRate });

      return {
        item: itemDoc?._id || it.item,
        description: it.description || itemDoc?.itemName || "",
        quantity,
        unit: it.unit || itemDoc?.uom || "pcs",
        unitPrice,
        gstRate,
        taxableValue,
        gstAmount,
        lineTotal,
      };
    })
  );

  const status = req.body?.status || "DRAFT";
  const quotation = await ProcurementQuotation.create({
    prReference: pr._id,
    suppliers,
    items,
    status,
    createdBy: req.user.id,
  });

  const populated = await ProcurementQuotation.findById(quotation._id)
    .populate("prReference", "prNumber status")
    .populate("suppliers", "name taxInfo.gstin")
    .populate("items.item");

  res.status(201).json(populated);
};

exports.submitForApproval = async (req, res) => {
  const q = await ProcurementQuotation.findById(req.params.id);
  if (!q) return res.status(404).json({ message: "Quotation not found" });
  if (q.status !== "DRAFT") return res.status(400).json({ message: "Only DRAFT quotations can be submitted" });

  q.status = "PENDING_APPROVAL";
  await q.save();
  res.json(q);
};

exports.approveQuotation = async (req, res) => {
  const q = await ProcurementQuotation.findById(req.params.id);
  if (!q) return res.status(404).json({ message: "Quotation not found" });
  if (q.status !== "PENDING_APPROVAL") {
    return res.status(400).json({ message: "Quotation is not pending approval" });
  }

  q.status = "APPROVED";
  q.approver = req.user.id;
  q.approvalDate = new Date();
  q.comments = req.body?.comments;
  await q.save();

  res.json(q);
};

exports.rejectQuotation = async (req, res) => {
  const q = await ProcurementQuotation.findById(req.params.id);
  if (!q) return res.status(404).json({ message: "Quotation not found" });
  if (q.status !== "PENDING_APPROVAL") {
    return res.status(400).json({ message: "Quotation is not pending approval" });
  }

  q.status = "REJECTED";
  q.approver = req.user.id;
  q.comments = req.body?.reason || req.body?.comments;
  await q.save();
  res.json(q);
};

exports.markSentToSuppliers = async (req, res) => {
  const q = await ProcurementQuotation.findById(req.params.id);
  if (!q) return res.status(404).json({ message: "Quotation not found" });
  if (q.status !== "APPROVED") {
    return res.status(400).json({ message: "Only APPROVED quotations can be sent to suppliers" });
  }

  q.status = "SENT";
  await q.save();
  res.json(q);
};

