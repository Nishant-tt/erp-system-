const CustomerPayment = require("../models/CustomerPayment");
const SalesInvoice = require("../models/SalesInvoice");

exports.createPayment = async (req, res) => {
    try {
        const paymentData = {
            ...req.body,
            processedBy: req.user.id
        };

        const payment = await CustomerPayment.create(paymentData);

        // Update Invoice status and amount paid
        const invoice = await SalesInvoice.findById(payment.invoiceReference);
        if (invoice) {
            invoice.amountPaid += payment.amount;
            if (invoice.amountPaid >= invoice.grandTotal) {
                invoice.status = 'PAID';
            } else {
                invoice.status = 'PARTIALLY_PAID';
            }
            await invoice.save();
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: "Error recording customer payment", error: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await CustomerPayment.find()
            .populate("customer", "name")
            .populate("invoiceReference", "invoiceNumber")
            .populate("processedBy", "name")
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching payments", error: error.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await CustomerPayment.findById(req.params.id)
            .populate("customer", "name")
            .populate("invoiceReference", "invoiceNumber")
            .populate("processedBy", "name");
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment", error: error.message });
    }
};
