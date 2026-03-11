const PO = require("../models/PO");
const PR = require("../models/PR");
const ProcurementQuotation = require("../models/ProcurementQuotation");
const { getRequiredRolesForPOAmount, userCanApprove } = require("../utils/procurementApprovals");
const { buildPdfBuffer, buildDocxBuffer } = require("../utils/exportDocs");

const calcLine = ({ quantity, unitCost, gstRate }) => {
    const qty = Number(quantity) || 0;
    const price = Number(unitCost) || 0;
    const rate = Number(gstRate) || 0;

    const taxableValue = qty * price;
    const gstAmount = taxableValue * (rate / 100);
    const lineTotal = taxableValue + gstAmount;
    return { taxableValue, gstAmount, lineTotal };
};

const computeDocAmount = (body) => {
    const direct = Number(body?.grandTotal) || Number(body?.totalAmount) || 0;
    if (direct > 0) return direct;

    const items = Array.isArray(body?.items) ? body.items : [];
    const sum = items.reduce((acc, it) => {
        const lineTotal = Number(it?.lineTotal);
        if (Number.isFinite(lineTotal) && lineTotal > 0) return acc + lineTotal;

        const taxable = Number(it?.taxableValue) || Number(it?.totalCost) || 0;
        const gst = Number(it?.gstAmount) || 0;
        return acc + taxable + gst;
    }, 0);
    return Number(sum) || 0;
};

exports.createPO = async (req, res) => {
    try {
        let pr = null;
        if (req.body?.prReference) {
            pr = await PR.findById(req.body.prReference);
            if (!pr) return res.status(400).json({ message: "Invalid PR reference" });
            if (pr.status !== "APPROVED") {
                return res.status(400).json({ message: "Only APPROVED PRs can be converted into a PO" });
            }
        }

        const amount = computeDocAmount(req.body);
        const requiredApprovalRoles = getRequiredRolesForPOAmount(amount);

        const now = new Date();
        const poData = {
            ...req.body,
            status: "DRAFT",
            approvalStatus: "PENDING_APPROVAL",
            requiredApprovalRoles,
            submittedBy: req.user.id,
            submittedAt: now,
            createdBy: req.user.id,
        };

        // Auto-fill cost center / delivery date from PR (if present)
        if (pr) {
            if (!poData.costCenter && pr.costCenter) poData.costCenter = pr.costCenter;
            if (!poData.expectedDeliveryDate && pr.requiredDate) poData.expectedDeliveryDate = pr.requiredDate;
        }

        // Optional admin shortcut
        if (req.body?.autoApprove === true && req.user.role === "Admin") {
            poData.approvalStatus = "APPROVED";
            poData.approvedBy = req.user.id;
            poData.approvedAt = now;
            poData.issuedBy = req.user.id;
            poData.issuedAt = now;
            poData.status = "OPEN";
        }

        const po = await PO.create(poData);

        const populatedPO = await PO.findById(po._id)
            .populate("supplier", "name contact taxInfo")
            .populate("items.item")
            .populate("createdBy", "name")
            .populate("submittedBy", "name")
            .populate("approvedBy", "name");

        res.status(201).json(populatedPO);
    } catch (error) {
        res.status(400).json({ message: "Error creating Purchase Order", error: error.message });
    }
};

exports.createPOFromQuotation = async (req, res) => {
    try {
        const quotation = await ProcurementQuotation.findById(req.params.quotationId)
            .populate("prReference")
            .populate("items.item");
        if (!quotation) return res.status(404).json({ message: "Quotation not found" });
        if (quotation.status !== "SENT") {
            return res.status(400).json({ message: "PO can only be generated after quotation is SENT to suppliers" });
        }

        const supplierId = req.body?.supplier;
        if (!supplierId) return res.status(400).json({ message: "Supplier is required to generate PO" });

        const supplierAllowed = (quotation.suppliers || []).some((s) => String(s) === String(supplierId));
        if (quotation.suppliers?.length > 0 && !supplierAllowed) {
            return res.status(400).json({ message: "Selected supplier is not part of this quotation" });
        }

        const items = (quotation.items || []).map((it) => {
            const unitCost = Number(it.unitPrice) || 0;
            const gstRate = Number(it.gstRate) || 0;
            const quantity = Number(it.quantity) || 0;
            const { taxableValue, gstAmount, lineTotal } = calcLine({ quantity, unitCost, gstRate });

            return {
                item: it.item?._id || it.item,
                description: it.description,
                quantity,
                unit: it.unit,
                unitCost,
                totalCost: taxableValue, // legacy (pre-GST) line total
                gstRate,
                taxableValue,
                gstAmount,
                lineTotal,
            };
        });

        const now = new Date();
        const requiredApprovalRoles = getRequiredRolesForPOAmount(quotation.grandTotal);

        const po = await PO.create({
            prReference: quotation.prReference?._id || quotation.prReference,
            quotationReference: quotation._id,
            supplier: supplierId,
            items,
            totalAmount: quotation.grandTotal,
            status: "DRAFT",
            approvalStatus: "PENDING_APPROVAL",
            requiredApprovalRoles,
            submittedBy: req.user.id,
            submittedAt: now,
            createdBy: req.user.id,
        });

        const populatedPO = await PO.findById(po._id)
            .populate("supplier", "name contact taxInfo")
            .populate("items.item")
            .populate("createdBy", "name")
            .populate("submittedBy", "name")
            .populate("approvedBy", "name")
            .populate("prReference", "prNumber")
            .populate("quotationReference", "quotationNumber status");

        res.status(201).json(populatedPO);
    } catch (error) {
        res.status(400).json({ message: "Error creating Purchase Order from quotation", error: error.message });
    }
};

exports.submitPOForApproval = async (req, res) => {
    try {
        const po = await PO.findById(req.params.id);
        if (!po) return res.status(404).json({ message: "Purchase Order not found" });

        if (po.approvalStatus === "APPROVED") {
            return res.status(400).json({ message: "PO is already approved" });
        }
        if (po.status !== "DRAFT") {
            return res.status(400).json({ message: "Only DRAFT POs can be submitted for approval" });
        }

        const amount = Number(po.grandTotal || po.totalAmount || 0);
        po.requiredApprovalRoles = getRequiredRolesForPOAmount(amount);
        po.approvalStatus = "PENDING_APPROVAL";
        po.submittedBy = req.user.id;
        po.submittedAt = new Date();
        await po.save();

        res.json(po);
    } catch (error) {
        res.status(400).json({ message: "Error submitting PO for approval", error: error.message });
    }
};

exports.approvePO = async (req, res) => {
    try {
        const po = await PO.findById(req.params.id);
        if (!po) return res.status(404).json({ message: "Purchase Order not found" });

        if (po.approvalStatus !== "PENDING_APPROVAL") {
            return res.status(400).json({ message: "PO is not pending approval" });
        }

        if (!userCanApprove(po.requiredApprovalRoles, req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${(po.requiredApprovalRoles || []).join(", ") || "(not set)"}`
            });
        }

        const now = new Date();
        po.approvalStatus = "APPROVED";
        po.approvedBy = req.user.id;
        po.approvedAt = now;
        po.approvalComments = req.body?.comments || "";

        // When approved, it becomes an issued PO (legal commitment)
        if (po.status === "DRAFT") {
            po.status = "OPEN";
            po.issuedBy = req.user.id;
            po.issuedAt = now;
        }

        await po.save();
        res.json(po);
    } catch (error) {
        res.status(400).json({ message: "Error approving PO", error: error.message });
    }
};

exports.rejectPO = async (req, res) => {
    try {
        const po = await PO.findById(req.params.id);
        if (!po) return res.status(404).json({ message: "Purchase Order not found" });

        if (po.approvalStatus !== "PENDING_APPROVAL") {
            return res.status(400).json({ message: "PO is not pending approval" });
        }

        if (!userCanApprove(po.requiredApprovalRoles, req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${(po.requiredApprovalRoles || []).join(", ") || "(not set)"}`
            });
        }

        po.approvalStatus = "REJECTED";
        po.rejectedBy = req.user.id;
        po.rejectedAt = new Date();
        po.rejectionReason = req.body?.reason || req.body?.comments || "";
        await po.save();

        res.json(po);
    } catch (error) {
        res.status(400).json({ message: "Error rejecting PO", error: error.message });
    }
};

exports.getPOs = async (req, res) => {
    try {
        const pos = await PO.find()
            .populate("supplier", "code name contact")
            .populate("items.item")
            .populate("createdBy", "name")
            .populate("submittedBy", "name")
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Purchase Orders", error: error.message });
    }
};

exports.getPOById = async (req, res) => {
    try {
        const po = await PO.findById(req.params.id)
            .populate("supplier")
            .populate("items.item")
            .populate("prReference")
            .populate("quotationReference")
            .populate("createdBy", "name")
            .populate("submittedBy", "name")
            .populate("approvedBy", "name")
            .populate("rejectedBy", "name")
            .populate("issuedBy", "name");

        if (!po) return res.status(404).json({ message: "Purchase Order not found" });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: "Error fetching PO details", error: error.message });
    }
};

exports.updatePOStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const po = await PO.findById(req.params.id);
        if (!po) return res.status(404).json({ message: "Purchase Order not found" });

        // Guard: do not allow operational status changes before PO approval.
        const needsApproval = po.approvalStatus && po.approvalStatus !== "APPROVED";
        const changingToOperational = ["OPEN", "PARTIALLY_RECEIVED", "RECEIVED", "CLOSED"].includes(String(status || ""));
        if (needsApproval && changingToOperational) {
            return res.status(400).json({ message: "PO must be APPROVED before it can be opened/received/closed" });
        }

        po.status = status;
        await po.save();
        res.json(po);
    } catch (error) {
        res.status(400).json({ message: "Error updating PO status", error: error.message });
    }
};


exports.exportPO = async (req, res) => {
    try {
        const format = String(req.params.format || "pdf").toLowerCase();
        if (!["pdf", "docx"].includes(format)) {
            return res.status(400).json({ message: "Invalid export format. Use pdf or docx." });
        }

        const po = await PO.findById(req.params.id)
            .populate("supplier", "code name contact taxInfo.gstin")
            .populate("items.item")
            .populate("createdBy", "name")
            .populate("approvedBy", "name")
            .populate("prReference", "prNumber")
            .populate("quotationReference", "quotationNumber");

        if (!po) return res.status(404).json({ message: "Purchase Order not found" });

        const title = `Purchase Order ${po.poNumber || ""}`.trim();
        const meta = [
            ["PO Number", po.poNumber],
            ["PO Date", po.orderDate ? new Date(po.orderDate).toLocaleDateString("en-IN") : ""],
            ["Vendor Name", po.supplier?.name || ""],
            ["Vendor Code", po.supplier?.code || ""],
            ["Delivery Date", po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString("en-IN") : ""],
            ["Delivery Location", po.deliveryLocation || ""],
            ["Payment Terms", po.paymentTerms || po.terms || ""],
            ["Shipping Method", po.shippingMethod || ""],
            ["Cost Center", po.costCenter || ""],
            ["Created By", po.createdBy?.name || ""],
            ["Approved By", po.approvedBy?.name || ""],
            ["PO Status", po.approvalStatus && po.approvalStatus !== "APPROVED" ? po.approvalStatus : po.status],
        ];

        const columns = ["Item Code", "Item Description", "Qty", "UOM", "Unit Price", "Discount", "GST", "Line Total"];
        const rows = (po.items || []).map((it) => ([
            it.item?.itemCode || "",
            it.description || it.item?.itemName || "",
            it.quantity ?? "",
            it.unit || it.item?.uom || "",
            it.unitCost ?? "",
            it.discount ?? 0,
            `${Number(it.gstAmount || 0)} (${Number(it.gstRate || 0)}%)`,
            it.lineTotal ?? "",
        ]));

        let buffer;
        let contentType;
        let filename;
        if (format === "pdf") {
            buffer = await buildPdfBuffer({ title, meta, columns, rows });
            contentType = "application/pdf";
            filename = `${po.poNumber || "PO"}.pdf`;
        } else {
            buffer = await buildDocxBuffer({ title, meta, columns, rows });
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            filename = `${po.poNumber || "PO"}.docx`;
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
        res.send(buffer);
    } catch (error) {
        res.status(400).json({ message: "Error exporting PO", error: error.message });
    }
};
