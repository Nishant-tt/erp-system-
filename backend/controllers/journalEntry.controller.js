const mongoose = require("mongoose");
const JournalEntry = require("../models/JournalEntry");
const FinancialYear = require("../models/FinancialYear");

exports.getEntries = async (req, res) => {
    try {
        const query = {};
        if (req.query.company) query.company = req.query.company;
        if (req.query.financialYear) query.financialYear = req.query.financialYear;

        const entries = await JournalEntry.find(query)
            .populate("items.account", "name code type")
            .populate("financialYear", "name")
            .sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching journal entries", error: error.message });
    }
};

exports.getEntryById = async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id)
            .populate("items.account")
            .populate("financialYear")
            .populate("company");
        if (!entry) return res.status(404).json({ message: "Journal entry not found" });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: "Error fetching entry details", error: error.message });
    }
};

exports.createEntry = async (req, res) => {
    try {
        // Enforce active financial year if not provided
        if (!req.body.financialYear) {
            const fy = await FinancialYear.findOne({ company: req.body.company, isActive: true });
            if (!fy) return res.status(400).json({ message: "Active Financial Year required" });
            req.body.financialYear = fy._id;
        }

        // Auto-generate entry number if not provided
        if (!req.body.entryNumber) {
            const count = await JournalEntry.countDocuments({ company: req.body.company });
            req.body.entryNumber = `JV-${String(count + 1).padStart(5, '0')}`;
        }

        const entry = await JournalEntry.create({
            ...req.body,
            createdBy: req.user ? req.user.id : null
        });
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ message: "Error creating journal entry", error: error.message });
    }
};

exports.getTrialBalance = async (req, res) => {
    try {
        const { company } = req.query;
        if (!company) return res.status(400).json({ message: "Company ID is required" });

        // Aggregate across all posted entries to get totals per account
        const trialBalance = await JournalEntry.aggregate([
            { $match: { company: new mongoose.Types.ObjectId(company), status: "Posted" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.account",
                    totalDebit: { $sum: "$items.debit" },
                    totalCredit: { $sum: "$items.credit" }
                }
            },
            {
                $lookup: {
                    from: "accounts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "accountDetails"
                }
            },
            { $unwind: "$accountDetails" },
            {
                $project: {
                    accountName: "$accountDetails.name",
                    accountCode: "$accountDetails.code",
                    accountType: "$accountDetails.type",
                    totalDebit: 1,
                    totalCredit: 1,
                    balance: { $subtract: ["$totalDebit", "$totalCredit"] }
                }
            },
            { $sort: { accountCode: 1 } }
        ]);

        res.json(trialBalance);
    } catch (error) {
        res.status(500).json({ message: "Error generating trial balance", error: error.message });
    }
};
