const PO = require("../models/PO");
const PR = require("../models/PR");
const ProcurementQuotation = require("../models/ProcurementQuotation");

const calcLine = ({ quantity, unitCost, gstRate }) => {
    const qty = Number(quantity) || 0;
    const price = Number(unitCost) || 0;
    const rate = Number(gstRate) || 0;

    const taxableValue = qty * price;
    const gstAmount = taxableValue * (rate / 100);
    const lineTotal = taxableValue + gstAmount;
    return { taxableValue, gstAmount, lineTotal };
};

exports.createPO = async (req, res) => {
    try {
        if (req.body?.prReference) {
            const pr = await PR.findById(req.body.prReference);
            if (!pr) return res.status(400).json({ message: "Invalid PR reference" });
            if (pr.status !== "APPROVED") {
                return res.status(400).json({ message: "Only APPROVED PRs can be converted into a PO" });
            }
        }

        const poData = {
            ...req.body,
            createdBy: req.user.id
        };

        const po = await PO.create(poData);

        // If this PO was created from a PR, we might want to link/update the PR status
        // Decisions: Does an 'APPROVED' PR status change when a PO is created? 
        // Let's assume for now we keep PR as is but reference it.

        const populatedPO = await PO.findById(po._id)
            .populate("supplier", "name contact")
            .populate("items.item")
            .populate("createdBy", "name");

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

        const po = await PO.create({
            prReference: quotation.prReference?._id || quotation.prReference,
            quotationReference: quotation._id,
            supplier: supplierId,
            items,
            totalAmount: quotation.grandTotal,
            status: "OPEN",
            createdBy: req.user.id,
        });

        const populatedPO = await PO.findById(po._id)
            .populate("supplier", "name contact taxInfo")
            .populate("items.item")
            .populate("createdBy", "name")
            .populate("prReference", "prNumber")
            .populate("quotationReference", "quotationNumber status");

        res.status(201).json(populatedPO);
    } catch (error) {
        res.status(400).json({ message: "Error creating Purchase Order from quotation", error: error.message });
    }
};

exports.getPOs = async (req, res) => {
    try {
        const pos = await PO.find()
            .populate("supplier", "name")
            .populate("items.item")
            .populate("createdBy", "name")
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
            .populate("createdBy", "name");

        if (!po) return res.status(404).json({ message: "Purchase Order not found" });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: "Error fetching PO details", error: error.message });
    }
};

exports.updatePOStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const po = await PO.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!po) return res.status(404).json({ message: "Purchase Order not found" });
        res.json(po);
    } catch (error) {
        res.status(400).json({ message: "Error updating PO status", error: error.message });
    }
};
