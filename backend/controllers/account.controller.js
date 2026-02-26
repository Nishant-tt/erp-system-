const Account = require("../models/Account");

exports.getAccounts = async (req, res) => {
    try {
        const query = {};
        if (req.query.company) query.company = req.query.company;

        const accounts = await Account.find(query).sort({ code: 1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching accounts", error: error.message });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const account = await Account.create(req.body);
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: "Error creating account", error: error.message });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.json(account);
    } catch (error) {
        res.status(400).json({ message: "Error updating account", error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account", error: error.message });
    }
};
