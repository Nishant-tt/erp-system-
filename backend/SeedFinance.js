const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Account = require("./models/Account");
const Company = require("./models/Company");
const FinancialYear = require("./models/FinancialYear");
const JournalEntry = require("./models/JournalEntry");

dotenv.config();

const seedFinance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp");
        console.log("Connected to MongoDB for Finance seeding...");

        // 1. Get or Create Default Company
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({
                name: "Demo Corp",
                email: "demo@example.com",
                phone: "1234567890",
                address: "New Delhi, India",
                gstin: "07AAAAA0000A1Z5"
            });
            console.log("Created Default Company");
        }

        // 2. Get or Create Default Financial Year
        let fy = await FinancialYear.findOne({ isActive: true });
        if (!fy) {
            fy = await FinancialYear.create({
                name: "FY 2024-25",
                code: "FY25",
                startDate: new Date("2024-04-01"),
                endDate: new Date("2025-03-31"),
                isActive: true,
                company: company._id
            });
            console.log("Created Default Financial Year");
        }

        // 3. Seed Chart of Accounts
        await Account.deleteMany({ company: company._id });
        const coaData = [
            { name: "Bank Account", code: "1000", type: "Asset", category: "Cash", company: company._id },
            { name: "Accounts Receivable", code: "1200", type: "Asset", category: "Current Asset", company: company._id },
            { name: "Inventory", code: "1500", type: "Asset", category: "Current Asset", company: company._id },
            { name: "Accounts Payable", code: "2000", type: "Liability", category: "Current Liability", company: company._id },
            { name: "Tax Payable", code: "2200", type: "Liability", category: "Current Liability", company: company._id },
            { name: "Owner Capital", code: "3000", type: "Equity", category: "Equity", company: company._id },
            { name: "Retained Earnings", code: "3500", type: "Equity", category: "Equity", company: company._id },
            { name: "Sales Revenue", code: "4000", type: "Revenue", category: "Income", company: company._id },
            { name: "Cost of Goods Sold", code: "5000", type: "Expense", category: "Expense", company: company._id },
            { name: "General Expenses", code: "5100", type: "Expense", category: "Expense", company: company._id }
        ];

        const insertedAccounts = await Account.insertMany(coaData);
        console.log("Seeded Chart of Accounts");

        // Helper to get Account by Code
        const getAcc = (code) => insertedAccounts.find(a => a.code === code)._id;

        // 4. Seed Journal Entries (Dummy Transactions)
        await JournalEntry.deleteMany({ company: company._id });

        const dummyEntries = [
            {
                entryNumber: "JV-00001",
                date: new Date("2024-04-01"),
                description: "Initial Capital Investment",
                status: "Posted",
                company: company._id,
                financialYear: fy._id,
                items: [
                    { account: getAcc("1000"), debit: 1000000, credit: 0, memo: "Startup Cash" },
                    { account: getAcc("3000"), debit: 0, credit: 1000000, memo: "Owner Investment" }
                ]
            },
            {
                entryNumber: "JV-00002",
                date: new Date("2024-04-05"),
                description: "Purchase of Inventory - Credit",
                status: "Posted",
                company: company._id,
                financialYear: fy._id,
                items: [
                    { account: getAcc("1500"), debit: 200000, credit: 0, memo: "Bulk Inventory Purchase" },
                    { account: getAcc("2000"), debit: 0, credit: 200000, memo: "Vendor Credit" }
                ]
            },
            {
                entryNumber: "JV-00003",
                date: new Date("2024-04-10"),
                description: "Sale of Goods - Credit",
                status: "Posted",
                company: company._id,
                financialYear: fy._id,
                items: [
                    { account: getAcc("1200"), debit: 150000, credit: 0, memo: "Invoiced Customer" },
                    { account: getAcc("4000"), debit: 0, credit: 150000, memo: "Sales Revenue" }
                ]
            },
            {
                entryNumber: "JV-00004",
                date: new Date("2024-04-15"),
                description: "Office Electricity & Rent",
                status: "Posted",
                company: company._id,
                financialYear: fy._id,
                items: [
                    { account: getAcc("5100"), debit: 25000, credit: 0, memo: "Utility Bills" },
                    { account: getAcc("1000"), debit: 0, credit: 25000, memo: "Bank Payment" }
                ]
            }
        ];

        await JournalEntry.insertMany(dummyEntries);
        console.log("Seeded Dummy Journal Entries");

        console.log("FINANCE SEEDING COMPLETED!");
        process.exit();
    } catch (error) {
        console.error("Finance Seeding Error:", error);
        process.exit(1);
    }
};

seedFinance();
