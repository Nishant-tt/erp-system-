const VendorPayment = require("../models/VendorPayment");
const PurchaseInvoice = require("../models/PurchaseInvoice");

exports.createPayment = async (req, res) => {
    try {
        const paymentData = {
            ...req.body,
            processedBy: req.user.id
        };

        const payment = await VendorPayment.create(paymentData);

        // Update Invoice status and amount paid
        const invoice = await PurchaseInvoice.findById(payment.invoiceReference);
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
        res.status(400).json({ message: "Error recording payment", error: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await VendorPayment.find()
            .populate("supplier", "name")
            .populate("invoiceReference", "invoiceNumber vendorInvoiceNumber")
            .populate("processedBy", "name")
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Payments", error: error.message });
    }
};
