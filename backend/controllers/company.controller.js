const Company = require("../models/Company");

exports.getCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ isActive: true });
        if (!company) {
            return res.status(404).json({ message: "Company information not found" });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: "Error fetching company data", error: error.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndUpdate(
            { isActive: true },
            req.body,
            { new: true, upsert: true } // Create if doesn't exist
        );
        res.json(company);
    } catch (error) {
        res.status(400).json({ message: "Error updating company data", error: error.message });
    }
};
