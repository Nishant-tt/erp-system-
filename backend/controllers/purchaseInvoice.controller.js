const PurchaseInvoice = require("../models/PurchaseInvoice");

exports.createInvoice = async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            createdBy: req.user.id
        };

        const invoice = await PurchaseInvoice.create(invoiceData);
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: "Error creating Purchase Invoice", error: error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await PurchaseInvoice.find()
            .populate("supplier", "name")
            .populate("poReference", "poNumber")
            .populate("grnReference", "grnNumber")
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Invoices", error: error.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await PurchaseInvoice.findById(req.params.id)
            .populate("supplier")
            .populate("poReference")
            .populate("grnReference")
            .populate("items.item");

        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Invoice details", error: error.message });
    }
};
