const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Lead = require("./models/Lead");
const Opportunity = require("./models/Opportunity");
const Quotation = require("./models/Quotation");
const SalesOrder = require("./models/SalesOrder");
const DeliveryNote = require("./models/DeliveryNote");
const SalesInvoice = require("./models/SalesInvoice");
const CustomerPayment = require("./models/CustomerPayment");
const User = require("./models/User");
const Customer = require("./models/Customer");
const ItemMaster = require("./models/ItemMaster");
const Role = require("./models/Role");

const seedSalesModule = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp");
        console.log("Connected to MongoDB for Sales Seeding...");

        // Robustly find an admin user
        const superAdminRole = await Role.findOne({ name: "Super Admin" });
        let adminUser;
        if (superAdminRole) {
            adminUser = await User.findOne({ role: superAdminRole._id });
        }

        if (!adminUser) {
            adminUser = await User.findOne(); // Fallback to any user
        }

        if (!adminUser) {
            console.error("No users found. Please run the main Seed.js first.");
            process.exit(1);
        }

        console.log(`Using admin user: ${adminUser.email}`);

        // Ensure we have customers
        let customers = await Customer.find();
        if (customers.length < 5) {
            console.log("Seeding dummy customers for sales lifecycle...");
            const dummyCustomers = [];
            for (let i = 1; i <= 7; i++) {
                dummyCustomers.push({
                    name: `Global Customer ${i}`,
                    contact: { email: `contact${i}@global.com`, phone: `987654321${i}` },
                    address: { city: "Mumbai", state: "Maharashtra", country: "India" },
                    isActive: true
                });
            }
            customers = await Customer.insertMany(dummyCustomers);
        }

        const items = await ItemMaster.find();
        if (items.length < 5) {
            console.error("Missing Item Master data. Please run the main Seed.js first.");
            process.exit(1);
        }

        // 1. Seed Leads (7)
        await Lead.deleteMany({});
        const sources = ["WEB", "REFERRAL", "EXHIBITION", "COLD_CALL"];
        const statuses = ["NEW", "CONTACTED", "QUALIFIED", "LOST"];
        const leads = [];
        for (let i = 1; i <= 7; i++) {
            try {
                const lead = await Lead.create({
                    firstName: "Prospect",
                    lastName: i.toString(),
                    companyName: `Inquiry Corp ${i}`,
                    email: `lead${i}@inquiry.com`,
                    phone: `900000000${i}`,
                    source: sources[i % 4],
                    status: i < 5 ? "QUALIFIED" : statuses[i % 4],
                    assignedTo: adminUser._id,
                    requirements: "Interested in bulk purchase of items."
                });
                leads.push(lead);
            } catch (err) {
                console.error(`Error creating Lead ${i}:`, err.message);
                throw err;
            }
        }
        console.log("Seeded Leads");

        // 2. Seed Opportunities (7)
        await Opportunity.deleteMany({});
        const oppStages = ["DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON"];
        const opportunities = [];
        for (let i = 0; i < 7; i++) {
            const opp = await Opportunity.create({
                title: `Deal with ${customers[i % customers.length].name}`,
                leadReference: leads[i]._id,
                customer: customers[i % customers.length]._id,
                expectedValue: 50000 + (i * 10000),
                closeDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
                probability: 20 + (i * 10),
                stage: i < 3 ? "WON" : oppStages[i % 4],
                createdBy: adminUser._id
            });
            opportunities.push(opp);
        }
        console.log("Seeded Opportunities");

        // 3. Seed Quotations (7)
        await Quotation.deleteMany({});
        const quotations = [];
        for (let i = 0; i < 7; i++) {
            const qty = 10 + i;
            const price = items[i % items.length].standardRate || 5000;
            const subtotal = qty * price;
            const tax = subtotal * 0.18;
            const quote = await Quotation.create({
                customer: customers[i % customers.length]._id,
                opportunityReference: opportunities[i]._id,
                items: [{
                    item: items[i % items.length]._id,
                    quantity: qty,
                    unitPrice: price,
                    taxRate: 18,
                    total: subtotal + tax
                }],
                subtotal,
                taxTotal: tax,
                grandTotal: subtotal + tax,
                status: i < 4 ? "ACCEPTED" : "SENT",
                createdBy: adminUser._id
            });
            quotations.push(quote);
        }
        console.log("Seeded Quotations");

        // 4. Seed Sales Orders (7)
        await SalesOrder.deleteMany({});
        const orders = [];
        for (let i = 0; i < 7; i++) {
            const qty = 10 + i;
            const price = items[i % items.length].standardRate || 5000;
            const subtotal = qty * price;
            const tax = subtotal * 0.18;
            const order = await SalesOrder.create({
                customer: customers[i % customers.length]._id,
                quotationReference: quotations[i]._id,
                items: [{
                    item: items[i % items.length]._id,
                    quantity: qty,
                    unitPrice: price,
                    total: subtotal + tax,
                    shippedQuantity: i < 3 ? qty : 0
                }],
                subtotal,
                taxTotal: tax,
                grandTotal: subtotal + tax,
                status: i < 3 ? "SHIPPED" : "OPEN",
                createdBy: adminUser._id
            });
            orders.push(order);
        }
        console.log("Seeded Sales Orders");

        // 5. Seed Delivery Notes (7)
        await DeliveryNote.deleteMany({});
        const deliveries = [];
        for (let i = 0; i < 7; i++) {
            const qty = 10 + i;
            const dn = await DeliveryNote.create({
                soReference: orders[i]._id,
                customer: customers[i % customers.length]._id,
                items: [{
                    item: items[i % items.length]._id,
                    shippedQuantity: qty
                }],
                vehicleNumber: `DL-01-S-${1000 + i}`,
                deliveredBy: "FastTrack Logistics",
                status: "DELIVERED",
                processedBy: adminUser._id
            });
            deliveries.push(dn);
        }
        console.log("Seeded Delivery Notes");

        // 6. Seed Sales Invoices (7)
        await SalesInvoice.deleteMany({});
        const invoices = [];
        for (let i = 0; i < 7; i++) {
            const qty = 10 + i;
            const price = items[i % items.length].standardRate || 5000;
            const subtotal = qty * price;
            const tax = subtotal * 0.18;
            const inv = await SalesInvoice.create({
                soReference: orders[i]._id,
                dnReference: deliveries[i]._id,
                customer: customers[i % customers.length]._id,
                items: [{
                    item: items[i % items.length]._id,
                    quantity: qty,
                    unitPrice: price,
                    taxAmount: tax,
                    total: subtotal + tax
                }],
                subtotal,
                taxTotal: tax,
                grandTotal: subtotal + tax,
                amountPaid: i < 2 ? (subtotal + tax) : 0,
                balanceAmount: i < 2 ? 0 : (subtotal + tax),
                status: i < 2 ? "PAID" : "UNPAID",
                createdBy: adminUser._id
            });
            invoices.push(inv);
        }
        console.log("Seeded Sales Invoices");

        // 7. Seed Payments (7)
        await CustomerPayment.deleteMany({});
        for (let i = 0; i < 7; i++) {
            const inv = invoices[i];
            if (i < 4) { // Only seed payments for first 4 invoices
                await CustomerPayment.create({
                    customer: inv.customer,
                    invoiceReference: inv._id,
                    amount: i < 2 ? inv.grandTotal : (inv.grandTotal / 2),
                    paymentMethod: "BANK_TRANSFER",
                    transactionId: `COL-TXN-${5000 + i}`,
                    processedBy: adminUser._id
                });
            }
        }
        console.log("Seeded Collections");

        console.log("SALES MODULE SEEDING COMPLETED!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error Details:", error);
        process.exit(1);
    }
};

seedSalesModule();
