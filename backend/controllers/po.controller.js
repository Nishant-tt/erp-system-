const PO = require("../models/PO");
const PR = require("../models/PR");

exports.createPO = async (req, res) => {
    try {
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
