const Opportunity = require("../models/Opportunity");

exports.createOpportunity = async (req, res) => {
    try {
        const opportunityData = {
            ...req.body,
            createdBy: req.user.id
        };
        const opportunity = await Opportunity.create(opportunityData);
        res.status(201).json(opportunity);
    } catch (error) {
        res.status(400).json({ message: "Error creating opportunity", error: error.message });
    }
};

exports.getOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find()
            .populate("leadReference")
            .populate("customer")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching opportunities", error: error.message });
    }
};

exports.getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate("leadReference")
            .populate("customer")
            .populate("createdBy", "name");
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
        res.json(opportunity);
    } catch (error) {
        res.status(500).json({ message: "Error fetching opportunity", error: error.message });
    }
};

exports.updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
        res.json(opportunity);
    } catch (error) {
        res.status(400).json({ message: "Error updating opportunity", error: error.message });
    }
};
