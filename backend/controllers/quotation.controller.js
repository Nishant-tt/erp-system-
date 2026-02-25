const Quotation = require("../models/Quotation");

exports.createQuotation = async (req, res) => {
    try {
        const quotationData = {
            ...req.body,
            createdBy: req.user.id
        };
        const quotation = await Quotation.create(quotationData);
        res.status(201).json(quotation);
    } catch (error) {
        res.status(400).json({ message: "Error creating quotation", error: error.message });
    }
};

exports.getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find()
            .populate("customer", "name")
            .populate("opportunityReference")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching quotations", error: error.message });
    }
};

exports.getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate("customer")
            .populate("opportunityReference")
            .populate("items.item")
            .populate("createdBy", "name");
        if (!quotation) return res.status(404).json({ message: "Quotation not found" });
        res.json(quotation);
    } catch (error) {
        res.status(500).json({ message: "Error fetching quotation", error: error.message });
    }
};

exports.updateQuotationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const quotation = await Quotation.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!quotation) return res.status(404).json({ message: "Quotation not found" });
        res.json(quotation);
    } catch (error) {
        res.status(400).json({ message: "Error updating quotation status", error: error.message });
    }
};
