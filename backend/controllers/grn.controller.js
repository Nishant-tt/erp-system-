const GRN = require("../models/GRN");
const PO = require("../models/PO");

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
                    poItem.receivedQuantity += grnItem.receivedQuantity;
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
            .populate("receivedBy", "name");

        if (!grn) return res.status(404).json({ message: "GRN not found" });
        res.json(grn);
    } catch (error) {
        res.status(500).json({ message: "Error fetching GRN details", error: error.message });
    }
};
