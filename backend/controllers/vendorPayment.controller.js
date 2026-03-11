const VendorPayment = require("../models/VendorPayment");
const PurchaseInvoice = require("../models/PurchaseInvoice");

exports.createPayment = async (req, res) => {
    try {
        const paymentData = {
            ...req.body,
            processedBy: req.user.id
        };

        const invoice = await PurchaseInvoice.findById(paymentData.invoiceReference);
        if (!invoice) {
            return res.status(400).json({ message: "Invalid invoice reference" });
        }

        // Enforce finance approval before payment (best practice)
        if (invoice.approvalStatus && invoice.approvalStatus !== "APPROVED") {
            return res.status(400).json({ message: "Invoice must be APPROVED before payment can be processed" });
        }

        if (["CANCELLED"].includes(invoice.status)) {
            return res.status(400).json({ message: "Cannot pay a cancelled invoice" });
        }

        const amount = Number(paymentData.amount) || 0;
        if (amount <= 0) {
            return res.status(400).json({ message: "Payment amount must be greater than 0" });
        }

        const balance = Number(invoice.balanceAmount) || (Number(invoice.grandTotal) - Number(invoice.amountPaid || 0));
        if (amount > balance + 1e-9) {
            return res.status(400).json({ message: `Payment amount exceeds invoice balance (balance: ${balance})` });
        }

        const payment = await VendorPayment.create(paymentData);

        // Update Invoice status and amount paid
        invoice.amountPaid += amount;
        if (invoice.amountPaid >= invoice.grandTotal) {
            invoice.status = 'PAID';
        } else {
            invoice.status = 'PARTIALLY_PAID';
        }
        await invoice.save();

        // --- AUTOMATED FINANCE POSTING ---
        try {
            const { createAutoJournalEntry } = require("../utils/financeHelper");
            await createAutoJournalEntry({
                reference: payment.transactionId || `VPAY-${payment._id}`,
                description: `Vendor Payment made for Invoice ${invoice ? invoice.vendorInvoiceNumber : ''}`,
                items: [
                    { accountCode: "2000", debit: amount },  // Accounts Payable
                    { accountCode: "1000", credit: amount }  // Bank/Cash
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
