const SalesInvoice = require("../models/SalesInvoice");
const SalesOrder = require("../models/SalesOrder");

exports.createInvoice = async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            createdBy: req.user.id
        };

        const invoice = await SalesInvoice.create(invoiceData);

        // Update Sales Order status
        if (invoice.soReference) {
            await SalesOrder.findByIdAndUpdate(invoice.soReference, { status: "INVOICED" });
        }

        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: "Error creating sales invoice", error: error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await SalesInvoice.find()
            .populate("customer", "name")
            .populate("soReference", "soNumber")
            .populate("dnReference", "dnNumber")
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Error fetching invoices", error: error.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await SalesInvoice.findById(req.params.id)
            .populate("customer")
            .populate("soReference")
            .populate("dnReference")
            .populate("items.item");

        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: "Error fetching invoice details", error: error.message });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await SalesInvoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ message: "Error updating invoice", error: error.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await SalesInvoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting invoice", error: error.message });
    }
};
