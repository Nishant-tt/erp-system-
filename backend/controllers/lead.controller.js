const Lead = require("../models/Lead");

exports.createLead = async (req, res) => {
    try {
        const lead = await Lead.create(req.body);
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: "Error creating lead", error: error.message });
    }
};

exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find().populate("assignedTo", "name").sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leads", error: error.message });
    }
};

exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).populate("assignedTo", "name");
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: "Error fetching lead", error: error.message });
    }
};

exports.updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: "Error updating lead", error: error.message });
    }
};
