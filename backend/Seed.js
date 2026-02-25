const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// Load ENV
dotenv.config();

// Models
const Role = require("./models/Role");
const Department = require("./models/Department");
const User = require("./models/User");
const ItemMaster = require("./models/ItemMaster");
const Supplier = require("./models/Supplier");
const PR = require("./models/PR");
const PO = require("./models/PO");
const GRN = require("./models/GRN");
const PurchaseInvoice = require("./models/PurchaseInvoice");
const VendorPayment = require("./models/VendorPayment");

const SEED_PASSWORD = "Password123";

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp");
        console.log("Connected to MongoDB for seeding...");

        // 1. Seed Roles
        await Role.deleteMany({});
        const rolesData = [
            { name: "Super Admin", permissions: ["ALL"] },
            { name: "Admin", permissions: ["ADMIN_ACCESS"] },
            { name: "Manager", permissions: ["APPROVAL_ACCESS"] },
            { name: "User", permissions: ["BASIC_ACCESS"] }
        ];
        const roles = await Role.insertMany(rolesData);
        const adminRole = roles[0]._id;
        const managerRole = roles[2]._id;
        console.log("Seeded Roles");

        // 2. Seed Departments
        await Department.deleteMany({});
        const deptsData = [
            { name: "IT Department", code: "IT01", budgetLimit: 5000000 },
            { name: "Marketing", code: "MKTG01", budgetLimit: 2000000 },
            { name: "Finance", code: "FIN01", budgetLimit: 10000000 },
            { name: "Operations", code: "OPS01", budgetLimit: 3000000 },
            { name: "Human Resources", code: "HR01", budgetLimit: 1000000 },
            { name: "Logistics", code: "LOG01", budgetLimit: 4000000 },
            { name: "Sales", code: "SALE01", budgetLimit: 2500000 }
        ];
        const depts = await Department.insertMany(deptsData);
        const itDept = depts[0]._id;
        console.log("Seeded Departments");

        // 3. Seed Users
        await User.deleteMany({});
        const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
        const usersData = [];
        for (let i = 1; i <= 3; i++) {
            usersData.push({
                name: `Admin User ${i}`,
                email: `admin${i}@example.com`,
                password: hashedPassword,
                role: adminRole,
                department: itDept,
                status: "ACTIVE"
            });
        }
        for (let i = 1; i <= 4; i++) {
            usersData.push({
                name: `Manager User ${i}`,
                email: `manager${i}@example.com`,
                password: hashedPassword,
                role: managerRole,
                department: depts[i % 7]._id,
                status: "ACTIVE"
            });
        }
        const users = await User.insertMany(usersData);
        const creatorId = users[0]._id;
        console.log("Seeded Users");

        // 4. Seed Item Master (7 items)
        await ItemMaster.deleteMany({});
        const itemsData = [
            { itemCode: "ITM-001", itemName: "Dell Latitude 5420", category: "Hardware", uom: "PCS", gstRate: 18, standardRate: 75000, isActive: true },
            { itemCode: "ITM-002", itemName: "Office Ergonomic Chair", category: "Furniture", uom: "PCS", gstRate: 12, standardRate: 12000, isActive: true },
            { itemCode: "ITM-003", itemName: "UltraSharp 27 Monitor", category: "Hardware", uom: "PCS", gstRate: 18, standardRate: 25000, isActive: true },
            { itemCode: "ITM-004", itemName: "Logitech MX Master 3", category: "Peripherals", uom: "PCS", gstRate: 18, standardRate: 8500, isActive: true },
            { itemCode: "ITM-005", itemName: "Wireless Keyboard K800", category: "Peripherals", uom: "PCS", gstRate: 18, standardRate: 4500, isActive: true },
            { itemCode: "ITM-006", itemName: "LaserJet Pro Printer", category: "Office Equipment", uom: "PCS", gstRate: 18, standardRate: 18000, isActive: true },
            { itemCode: "ITM-007", itemName: "HDMI Cable 5m", category: "Cables", uom: "MTR", gstRate: 18, standardRate: 1200, isActive: true }
        ];
        const items = await ItemMaster.insertMany(itemsData);
        console.log("Seeded Item Master");

        // 5. Seed Suppliers (7 suppliers)
        await Supplier.deleteMany({});
        const suppliersData = [
            { name: "TechHub Solutions", contact: { email: "sales@techhub.com", phone: "9876543210" }, taxInfo: { gstin: "27AAAAA0000A1Z5" }, isActive: true },
            { name: "Comfort Seating Pvt Ltd", contact: { email: "info@comfortseating.com", phone: "9876543211" }, taxInfo: { gstin: "27BBBBB0000B1Z6" }, isActive: true },
            { name: "Global Impex", contact: { email: "connect@globalimpex.com", phone: "9876543212" }, taxInfo: { gstin: "27CCCCC0000C1Z7" }, isActive: true },
            { name: "Office World", contact: { email: "orders@officeworld.com", phone: "9876543213" }, taxInfo: { gstin: "27DDDDD0000D1Z8" }, isActive: true },
            { name: "PrintMaster Co", contact: { email: "printer@printmaster.com", phone: "9876543214" }, taxInfo: { gstin: "27EEEEE0000E1Z9" }, isActive: true },
            { name: "Gadget Galaxy", contact: { email: "sales@gadgetgalaxy.com", phone: "9876543215" }, taxInfo: { gstin: "27FFFFF0000F1ZA" }, isActive: true },
            { name: "Digital Assets", contact: { email: "info@digitalassets.com", phone: "9876543216" }, taxInfo: { gstin: "27GGGGG0000G1ZB" }, isActive: true }
        ];
        const suppliers = await Supplier.insertMany(suppliersData);
        console.log("Seeded Suppliers");

        // 6. Seed Purchase Requisitions (7 records)
        await PR.deleteMany({});
        const prs = [];
        for (let i = 0; i < 7; i++) {
            const qty = 5 + i;
            const unitCost = items[i % 7].standardRate;
            const pr = await PR.create({
                requestedBy: creatorId,
                department: itDept,
                items: [{
                    item: items[i % 7]._id,
                    quantity: qty,
                    estimatedUnitCost: unitCost,
                    totalCost: qty * unitCost,
                    unit: items[i % 7].uom
                }],
                totalAmount: qty * unitCost * 1.18, // Incl GST
                status: i < 3 ? "APPROVED" : (i === 3 ? "PENDING_APPROVAL" : "APPROVED"),
            });
            prs.push(pr);
            console.log(`Created PR ${i + 1}`);
        }
        console.log("Seeded PRs");

        // 7. Seed Purchase Orders (7 records)
        await PO.deleteMany({});
        const pos = [];
        for (let i = 0; i < 7; i++) {
            const qty = 5 + i;
            const unitCost = items[i % 7].standardRate;
            const po = await PO.create({
                prReference: prs[i % 7]._id,
                supplier: suppliers[i % 7]._id,
                items: [{
                    item: items[i % 7]._id,
                    quantity: qty,
                    unitCost: unitCost,
                    totalCost: qty * unitCost,
                    unit: items[i % 7].uom,
                    receivedQuantity: i < 2 ? qty : 0
                }],
                totalAmount: qty * unitCost * 1.18,
                status: i < 2 ? "RECEIVED" : "OPEN",
                createdBy: creatorId
            });
            pos.push(po);
            console.log(`Created PO ${i + 1}`);
        }
        console.log("Seeded POs");

        // 8. Seed GRNs (7 records)
        await GRN.deleteMany({});
        const grns = [];
        for (let i = 0; i < 7; i++) {
            const qty = 5 + i;
            const unitCost = items[i % 7].standardRate;
            const grn = await GRN.create({
                poReference: pos[i % 7]._id,
                supplier: suppliers[i % 7]._id,
                items: [{
                    item: items[i % 7]._id,
                    orderedQuantity: qty,
                    receivedQuantity: qty,
                    rejectedQuantity: 0,
                    unit: items[i % 7].uom,
                    unitCost: unitCost
                }],
                receivedBy: creatorId,
                receivedDate: new Date(),
                vehicleNumber: `MH-12-AB-${1000 + i}`,
                status: "COMPLETED"
            });
            grns.push(grn);
            console.log(`Created GRN ${i + 1}`);
        }
        console.log("Seeded GRNs");

        // 9. Seed Purchase Invoices (7 records)
        await PurchaseInvoice.deleteMany({});
        const invs = [];
        for (let i = 0; i < 7; i++) {
            const qty = 5 + i;
            const unitCost = items[i % 7].standardRate;
            const subtotal = qty * unitCost;
            const taxTotal = subtotal * 0.18;
            const grandTotal = subtotal + taxTotal;
            const inv = await PurchaseInvoice.create({
                vendorInvoiceNumber: `V-INV-${100 + i}`,
                poReference: pos[i % 7]._id,
                grnReference: grns[i % 7]._id,
                supplier: suppliers[i % 7]._id,
                items: [{
                    item: items[i % 7]._id,
                    quantity: qty,
                    unitCost: unitCost,
                    taxAmount: taxTotal,
                    totalCost: grandTotal
                }],
                subtotal: subtotal,
                taxTotal: taxTotal,
                grandTotal: grandTotal,
                amountPaid: i < 3 ? grandTotal : 0,
                balanceAmount: i < 3 ? 0 : grandTotal,
                invoiceDate: new Date(),
                status: i < 3 ? "PAID" : "UNPAID",
                createdBy: creatorId
            });
            invs.push(inv);
            console.log(`Created Invoice ${i + 1}`);
        }
        console.log("Seeded Purchase Invoices");

        // 10. Seed Vendor Payments (7 records)
        await VendorPayment.deleteMany({});
        for (let i = 0; i < 7; i++) {
            const inv = invs[i % 7];
            await VendorPayment.create({
                supplier: inv.supplier,
                invoiceReference: inv._id,
                amount: i < 3 ? inv.grandTotal : (inv.grandTotal / 2),
                paymentDate: new Date(),
                paymentMethod: i % 2 === 0 ? "BANK_TRANSFER" : "CHEQUE",
                transactionId: `TXN-${9999 + i}`,
                status: "COMPLETED",
                processedBy: creatorId
            });
            console.log(`Created Payment ${i + 1}`);
        }
        console.log("Seeded Vendor Payments");

        console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
        process.exit();
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();