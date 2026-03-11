const ProcurementQuotation = require("../models/ProcurementQuotation");
const PR = require("../models/PR");
const ItemMaster = require("../models/ItemMaster");
const { buildPdfBuffer, buildDocxBuffer } = require("../utils/exportDocs");

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
    .populate("suppliers", "code name contact taxInfo.gstin")
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
  const rfqDate = req.body?.rfqDate ? new Date(req.body.rfqDate) : new Date();
  const requestedDeliveryDate = req.body?.requestedDeliveryDate
    ? new Date(req.body.requestedDeliveryDate)
    : (pr.requiredDate ? new Date(pr.requiredDate) : undefined);
  const quotationDueDate = req.body?.quotationDueDate ? new Date(req.body.quotationDueDate) : undefined;
  const termsConditions = req.body?.termsConditions || "";
  const currency = req.body?.currency || "INR";
  const remarks = req.body?.remarks || "";

  const quotation = await ProcurementQuotation.create({
    prReference: pr._id,
    suppliers,
    items,
    status,
    rfqDate,
    requestedDeliveryDate,
    quotationDueDate,
    termsConditions,
    currency,
    remarks,
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

exports.exportRFQ = async (req, res) => {
  try {
    const format = String(req.params.format || "pdf").toLowerCase();
    if (!["pdf", "docx"].includes(format)) {
      return res.status(400).json({ message: "Invalid export format. Use pdf or docx." });
    }

    const q = await ProcurementQuotation.findById(req.params.id)
      .populate({
        path: "prReference",
        populate: [
          { path: "requestedBy", select: "name email" },
          { path: "department", select: "name code" },
        ],
      })
      .populate("items.item")
      .populate("suppliers", "code name contact taxInfo.gstin")
      .populate("createdBy", "name")
      .populate("approver", "name");

    if (!q) return res.status(404).json({ message: "Quotation not found" });

    const title = `RFQ ${q.quotationNumber || ""}`.trim();
    const meta = [
      ["RFQ Number", q.quotationNumber],
      ["RFQ Date", q.rfqDate ? new Date(q.rfqDate).toLocaleDateString("en-IN") : ""],
      ["PR Reference", q.prReference?.prNumber || ""],
      ["Requested Delivery Date", q.requestedDeliveryDate ? new Date(q.requestedDeliveryDate).toLocaleDateString("en-IN") : ""],
      ["Quotation Due Date", q.quotationDueDate ? new Date(q.quotationDueDate).toLocaleDateString("en-IN") : ""],
      ["Currency", q.currency || "INR"],
      ["RFQ Status", q.status || ""],
      ["Suppliers", (q.suppliers || []).map((s) => s.name).join(", ")],
    ];

    const columns = ["Item Code", "Item Description", "Qty", "UOM", "Unit Price", "GST%", "Line Total"];
    const rows = (q.items || []).map((it) => ([
      it.item?.itemCode || "",
      it.description || it.item?.itemName || "",
      it.quantity ?? "",
      it.unit || it.item?.uom || "",
      it.unitPrice ?? "",
      it.gstRate ?? "",
      it.lineTotal ?? "",
    ]));

    let buffer;
    let contentType;
    let filename;
    if (format === "pdf") {
      buffer = await buildPdfBuffer({ title, meta, columns, rows });
      contentType = "application/pdf";
      filename = `${q.quotationNumber || "RFQ"}.pdf`;
    } else {
      buffer = await buildDocxBuffer({ title, meta, columns, rows });
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filename = `${q.quotationNumber || "RFQ"}.docx`;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ message: "Error exporting RFQ", error: error.message });
  }
};
