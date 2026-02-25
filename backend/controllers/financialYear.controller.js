const FinancialYear = require("../models/FinancialYear");
const Company = require("../models/Company");

exports.getFinancialYears = async (req, res) => {
    try {
        const years = await FinancialYear.find().populate("company", "name").sort({ startDate: -1 });
        res.json(years);
    } catch (error) {
        res.status(500).json({ message: "Error fetching financial years", error: error.message });
    }
};

exports.createFinancialYear = async (req, res) => {
    try {
        // Auto-associate with the single company if not provided
        if (!req.body.company) {
            const company = await Company.findOne({ isActive: true });
            if (company) req.body.company = company._id;
        }

        const fyear = await FinancialYear.create(req.body);

        // If this is set to active, deactivate others
        if (fyear.isActive) {
            await FinancialYear.updateMany({ _id: { $ne: fyear._id } }, { isActive: false });
        }

        res.status(201).json(fyear);
    } catch (error) {
        res.status(400).json({ message: "Error creating financial year", error: error.message });
    }
};

exports.updateFinancialYear = async (req, res) => {
    try {
        const fyear = await FinancialYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fyear) return res.status(404).json({ message: "Financial year not found" });

        if (req.body.isActive) {
            await FinancialYear.updateMany({ _id: { $ne: fyear._id } }, { isActive: false });
        }

        res.json(fyear);
    } catch (error) {
        res.status(400).json({ message: "Error updating financial year", error: error.message });
    }
};

exports.deleteFinancialYear = async (req, res) => {
    try {
        const fyear = await FinancialYear.findByIdAndDelete(req.params.id);
        if (!fyear) return res.status(404).json({ message: "Financial year not found" });
        res.json({ message: "Financial year deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting financial year", error: error.message });
    }
};

exports.getCurrentYear = async (req, res) => {
    try {
        const year = await FinancialYear.findOne({ isActive: true });
        if (!year) return res.status(404).json({ message: "No active financial year found" });
        res.json(year);
    } catch (error) {
        res.status(500).json({ message: "Error fetching current year", error: error.message });
    }
};
