const GRN = require("../models/GRN");
const PO = require("../models/PO");
const ItemMaster = require("../models/ItemMaster");
const { buildPdfBuffer, buildDocxBuffer } = require("../utils/exportDocs");

exports.createGRN = async (req, res) => {
    try {
        const grnData = {
            ...req.body,
            receivedBy: req.user.id
        };

        // Validate PO is issued/approved before receiving goods
        const po = await PO.findById(grnData.poReference);
        if (!po) {
            return res.status(400).json({ message: "Invalid PO reference" });
        }
        if (po.approvalStatus && po.approvalStatus !== "APPROVED") {
            return res.status(400).json({ message: "Cannot create GRN for a PO that is not APPROVED" });
        }
        if (po.status === "DRAFT") {
            return res.status(400).json({ message: "Cannot create GRN for a DRAFT (not issued) PO" });
        }
        if (grnData.supplier && String(po.supplier) !== String(grnData.supplier)) {
            return res.status(400).json({ message: "GRN supplier must match PO supplier" });
        }

        // Normalize accepted quantities for storage/reporting
        grnData.items = (grnData.items || []).map((it) => {
            const received = Number(it.receivedQuantity) || 0;
            const rejected = Number(it.rejectedQuantity) || 0;
            const accepted = Math.max(0, received - rejected);
            return { ...it, acceptedQuantity: accepted };
        });

        const grn = await GRN.create(grnData);

        // Update PO received quantities
        grn.items.forEach(grnItem => {
            const poItem = po.items.find(item => item.item.toString() === grnItem.item.toString());
            if (poItem) {
                // Only accepted quantities should progress PO (rejected are treated as returned to supplier)
                const received = Number(grnItem.receivedQuantity) || 0;
                const rejected = Number(grnItem.rejectedQuantity) || 0;
                const accepted = Math.max(0, received - rejected);
                poItem.receivedQuantity += accepted;
            }
        });

        // Check if PO is fully received
        const allReceived = po.items.every(item => item.receivedQuantity >= item.quantity);
        if (allReceived) {
            po.status = 'RECEIVED';
        } else if (po.items.some(item => item.receivedQuantity > 0)) {
            po.status = 'PARTIALLY_RECEIVED';
        }

        await po.save();

        // Update inventory (ItemMaster.stockOnHand) for accepted quantities
        // Accepted = received - rejected (clamped at 0)
        await Promise.all(
            (grn.items || []).map(async (grnItem) => {
                const received = Number(grnItem.receivedQuantity) || 0;
                const rejected = Number(grnItem.rejectedQuantity) || 0;
                const accepted = Math.max(0, received - rejected);
                if (accepted <= 0) return;
                await ItemMaster.updateOne(
                    { _id: grnItem.item },
                    { $inc: { stockOnHand: accepted } }
                );
            })
        );

        res.status(201).json(grn);
    } catch (error) {
        res.status(400).json({ message: "Error creating GRN", error: error.message });
    }
};

exports.getGRNs = async (req, res) => {
    try {
        const grns = await GRN.find()
            .populate("supplier", "code name contact")
            .populate("poReference", "poNumber")
            .populate("items.item")
            .populate("receivedBy", "name")
            .sort({ createdAt: -1 });
        res.json(grns);
    } catch (error) {
        res.status(500).json({ message: "Error fetching GRNs", error: error.message });
    }
};

exports.getGRNById = async (req, res) => {
    try {
        const grn = await GRN.findById(req.params.id)
            .populate("supplier")
            .populate("poReference")
            .populate("items.item")
            .populate("receivedBy", "name")
            .populate("verifiedBy", "name");

        if (!grn) return res.status(404).json({ message: "GRN not found" });
        res.json(grn);
    } catch (error) {
        res.status(500).json({ message: "Error fetching GRN details", error: error.message });
    }
};

exports.verifyGRN = async (req, res) => {
    try {
        const grn = await GRN.findById(req.params.id);
        if (!grn) return res.status(404).json({ message: "GRN not found" });
        if (grn.verificationStatus === "VERIFIED") {
            return res.status(400).json({ message: "GRN is already verified" });
        }
        grn.verificationStatus = "VERIFIED";
        grn.verifiedBy = req.user.id;
        grn.verifiedAt = new Date();
        grn.verificationComments = req.body?.comments || "";
        await grn.save();
        res.json(grn);
    } catch (error) {
        res.status(400).json({ message: "Error verifying GRN", error: error.message });
    }
};

exports.rejectGRN = async (req, res) => {
    try {
        const grn = await GRN.findById(req.params.id);
        if (!grn) return res.status(404).json({ message: "GRN not found" });
        if (grn.verificationStatus === "VERIFIED") {
            return res.status(400).json({ message: "Verified GRN cannot be rejected" });
        }
        grn.verificationStatus = "REJECTED";
        grn.verifiedBy = req.user.id;
        grn.verifiedAt = new Date();
        grn.verificationComments = req.body?.reason || req.body?.comments || "";
        await grn.save();
        res.json(grn);
    } catch (error) {
        res.status(400).json({ message: "Error rejecting GRN", error: error.message });
    }
};

exports.exportGRN = async (req, res) => {
    try {
        const format = String(req.params.format || "pdf").toLowerCase();
        if (!["pdf", "docx"].includes(format)) {
            return res.status(400).json({ message: "Invalid export format. Use pdf or docx." });
        }

        const grn = await GRN.findById(req.params.id)
            .populate("supplier", "code name contact")
            .populate("poReference", "poNumber")
            .populate("items.item", "itemCode itemName uom")
            .populate("receivedBy", "name")
            .populate("verifiedBy", "name");

        if (!grn) return res.status(404).json({ message: "GRN not found" });

        const title = `Goods Receipt Note ${grn.grnNumber || ""}`.trim();
        const meta = [
            ["GRN Number", grn.grnNumber],
            ["GRN Date", grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString("en-IN") : ""],
            ["PO Number", grn.poReference?.poNumber || ""],
            ["Vendor Name", grn.supplier?.name || ""],
            ["Vendor Code", grn.supplier?.code || ""],
            ["Warehouse Location", grn.warehouseLocation || ""],
            ["Inspection Status", grn.inspectionStatus || ""],
            ["Received By", grn.receivedBy?.name || ""],
            ["Verification Status", grn.verificationStatus || ""],
            ["Verified By", grn.verifiedBy?.name || ""],
        ];

        const columns = ["Item Code", "Item Description", "Ordered Qty", "Received Qty", "Accepted Qty", "Rejected Qty", "UOM"];
        const rows = (grn.items || []).map((it) => ([
            it.item?.itemCode || "",
            it.item?.itemName || "",
            it.orderedQuantity ?? "",
            it.receivedQuantity ?? "",
            it.acceptedQuantity ?? Math.max(0, (Number(it.receivedQuantity) || 0) - (Number(it.rejectedQuantity) || 0)),
            it.rejectedQuantity ?? 0,
            it.unit || it.item?.uom || "",
        ]));

        let buffer;
        let contentType;
        let filename;
        if (format === "pdf") {
            buffer = await buildPdfBuffer({ title, meta, columns, rows });
            contentType = "application/pdf";
            filename = `${grn.grnNumber || "GRN"}.pdf`;
        } else {
            buffer = await buildDocxBuffer({ title, meta, columns, rows });
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            filename = `${grn.grnNumber || "GRN"}.docx`;
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
        res.send(buffer);
    } catch (error) {
        res.status(400).json({ message: "Error exporting GRN", error: error.message });
    }
};
