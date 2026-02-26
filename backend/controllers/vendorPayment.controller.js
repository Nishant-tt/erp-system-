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

        // --- AUTOMATED FINANCE POSTING ---
        try {
            const { createAutoJournalEntry } = require("../utils/financeHelper");
            await createAutoJournalEntry({
                reference: payment.transactionId || `VPAY-${payment._id}`,
                description: `Vendor Payment made for Invoice ${invoice ? invoice.vendorInvoiceNumber : ''}`,
                items: [
                    { accountCode: "2000", debit: payment.amount },  // Accounts Payable
                    { accountCode: "1000", credit: payment.amount }  // Bank/Cash
                ]
            });
        } catch (finError) {
            console.error("Finance Posting Failed:", finError.message);
        }
        // ---------------------------------

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
