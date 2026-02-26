const JournalEntry = require("../models/JournalEntry");
const Account = require("../models/Account");
const FinancialYear = require("../models/FinancialYear");

/**
 * Creates a Journal Entry for a given transaction
 * @param {Object} data - Entry data { company, reference, description, items }
 * @param {Array} data.items - Array of { accountCode, debit, credit }
 */
const createAutoJournalEntry = async (data) => {
    try {
        let { company, reference, description, items } = data;

        // 1. Get Company (fetch default if not provided)
        if (!company) {
            const Company = require("../models/Company");
            const defaultCompany = await Company.findOne();
            if (!defaultCompany) throw new Error("No company found in database");
            company = defaultCompany._id;
        }

        // 2. Get Active Financial Year
        const fy = await FinancialYear.findOne({ company, isActive: true });
        if (!fy) throw new Error("No active financial year found");

        // 2. Map Account Codes to IDs
        const entryItems = await Promise.all(items.map(async (item) => {
            const acc = await Account.findOne({ code: item.accountCode, company });
            if (!acc) throw new Error(`Account code ${item.accountCode} not found`);
            return {
                account: acc._id,
                debit: item.debit || 0,
                credit: item.credit || 0,
                memo: item.memo || description
            };
        }));

        // 3. Generate Entry Number (Simple version, could be more robust)
        const count = await JournalEntry.countDocuments({ company });
        const entryNumber = `JV-${String(count + 1).padStart(5, '0')}`;

        // 4. Create and Save Journal Entry
        const journalEntry = new JournalEntry({
            entryNumber,
            date: new Date(),
            reference,
            description,
            status: "Posted",
            items: entryItems,
            company,
            financialYear: fy._id
        });

        await journalEntry.save();
        return journalEntry;
    } catch (error) {
        console.error("Error creating auto journal entry:", error.message);
        throw error;
    }
};

module.exports = { createAutoJournalEntry };
