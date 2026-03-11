const GRN = require("../models/GRN");
const PO = require("../models/PO");
const ItemMaster = require("../models/ItemMaster");

exports.createGRN = async (req, res) => {
    try {
        const grnData = {
            ...req.body,
            receivedBy: req.user.id
        };

        const grn = await GRN.create(grnData);

        // Update PO received quantities
        const po = await PO.findById(grn.poReference);
        if (po) {
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
        }

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
            .populate("supplier", "name")
            .populate("poReference", "poNumber")
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
