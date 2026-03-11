const PurchaseInvoice = require("../models/PurchaseInvoice");
const PO = require("../models/PO");
const GRN = require("../models/GRN");
const { createAutoJournalEntry } = require("../utils/financeHelper");

const PRICE_TOLERANCE = 0.01; // INR paise-level tolerance

function roughlyEqual(a, b, tolerance = PRICE_TOLERANCE) {
    const x = Number(a) || 0;
    const y = Number(b) || 0;
    return Math.abs(x - y) <= tolerance;
}

function toId(val) {
    return val ? String(val) : "";
}

exports.createInvoice = async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            createdBy: req.user.id
        };

        const matchErrors = [];
        let matchStatus = "PENDING";
        let approvalStatus = "PENDING_APPROVAL";

        // Enforce 3-way match when PO + GRN are provided (recommended path)
        const hasGRN = Boolean(invoiceData.grnReference);
        const hasPO = Boolean(invoiceData.poReference);

        let grn = null;
        let po = null;

        if (hasGRN) {
            grn = await GRN.findById(invoiceData.grnReference).populate("items.item");
            if (!grn) {
                return res.status(400).json({ message: "Invalid GRN reference" });
            }
            if (grn.verificationStatus !== "VERIFIED") {
                return res.status(400).json({ message: "Only VERIFIED GRNs can be invoiced" });
            }

            // If PO not provided, infer from GRN
            if (!invoiceData.poReference) {
                invoiceData.poReference = grn.poReference;
            }
            // Ensure supplier matches
            if (invoiceData.supplier && toId(invoiceData.supplier) !== toId(grn.supplier)) {
                return res.status(400).json({ message: "Invoice supplier must match GRN supplier" });
            }
            invoiceData.supplier = grn.supplier;
        }

        if (invoiceData.poReference) {
            po = await PO.findById(invoiceData.poReference);
            if (!po) {
                return res.status(400).json({ message: "Invalid PO reference" });
            }
            if (po.approvalStatus && po.approvalStatus !== "APPROVED") {
                return res.status(400).json({ message: "PO must be APPROVED before invoice processing" });
            }
            if (invoiceData.supplier && toId(invoiceData.supplier) !== toId(po.supplier)) {
                return res.status(400).json({ message: "Invoice supplier must match PO supplier" });
            }
            invoiceData.supplier = po.supplier;

            // Auto-fill payment terms from PO if not provided
            if (!invoiceData.paymentTerms) {
                invoiceData.paymentTerms = po.paymentTerms || po.terms || "";
            }
        }

        const doingThreeWay = Boolean(grn && po);
        if (doingThreeWay) {
            if (toId(grn.poReference) !== toId(po._id)) {
                matchErrors.push("GRN does not belong to the provided PO");
            }

            const poByItem = new Map();
            (po.items || []).forEach((it) => {
                poByItem.set(toId(it.item), {
                    poQty: Number(it.quantity) || 0,
                    poUnitCost: Number(it.unitCost) || 0,
                });
            });

            const grnByItem = new Map();
            (grn.items || []).forEach((it) => {
                const received = Number(it.receivedQuantity) || 0;
                const rejected = Number(it.rejectedQuantity) || 0;
                const accepted = Math.max(0, received - rejected);
                grnByItem.set(toId(it.item?._id || it.item), {
                    acceptedQty: accepted,
                });
            });

            const invItems = Array.isArray(invoiceData.items) ? invoiceData.items : [];
            for (const invItem of invItems) {
                const itemId = toId(invItem.item);
                const invQty = Number(invItem.quantity) || 0;
                const invUnitCost = Number(invItem.unitCost) || 0;

                const poIt = poByItem.get(itemId);
                if (!poIt) {
                    matchErrors.push(`Item ${itemId} not found on PO`);
                    continue;
                }

                const grnIt = grnByItem.get(itemId);
                if (!grnIt) {
                    matchErrors.push(`Item ${itemId} not found on GRN`);
                    continue;
                }

                if (invQty > grnIt.acceptedQty + 1e-9) {
                    matchErrors.push(`Item ${itemId} invoice qty (${invQty}) exceeds GRN accepted qty (${grnIt.acceptedQty})`);
                }

                if (!roughlyEqual(invUnitCost, poIt.poUnitCost)) {
                    matchErrors.push(`Item ${itemId} unit cost (${invUnitCost}) does not match PO unit cost (${poIt.poUnitCost})`);
                }
            }

            matchStatus = matchErrors.length === 0 ? "MATCHED" : "MISMATCHED";
            approvalStatus = matchErrors.length === 0 ? "PENDING_APPROVAL" : "ON_HOLD";
        } else if (hasGRN || hasPO) {
            // Partial references: keep on hold for manual review (not a full 3-way match)
            matchStatus = "PENDING";
            approvalStatus = "ON_HOLD";
            matchErrors.push("Missing PO or GRN reference for 3-way match");
        }

        invoiceData.matchStatus = matchStatus;
        invoiceData.matchErrors = matchErrors;
        invoiceData.approvalStatus = approvalStatus;

        const invoice = await PurchaseInvoice.create(invoiceData);

        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: "Error creating Purchase Invoice", error: error.message });
    }
};

exports.approveInvoice = async (req, res) => {
    try {
        const invoice = await PurchaseInvoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        const force = req.body?.force === true;
        if (invoice.approvalStatus === "APPROVED") {
            return res.status(400).json({ message: "Invoice is already approved" });
        }

        if (invoice.matchStatus !== "MATCHED" && !(force && req.user.role === "Admin")) {
            return res.status(400).json({ message: "Invoice is not 3-way matched. Resolve mismatches before approval." });
        }

        invoice.approvalStatus = "APPROVED";
        invoice.approvedBy = req.user.id;
        invoice.approvedAt = new Date();
        invoice.approvalComments = req.body?.comments || "";

        // Post to finance only when invoice is approved (aligned with AP/finance controls)
        if (!invoice.financePosted) {
            try {
                await createAutoJournalEntry({
                    reference: invoice.vendorInvoiceNumber,
                    description: `Purchase Invoice from ${invoice.vendorInvoiceNumber}`,
                    items: [
                        { accountCode: "5000", debit: invoice.subtotal },    // Purchase Expense / COGS
                        { accountCode: "2000", credit: invoice.grandTotal },  // Accounts Payable
                        // { accountCode: "1600", debit: invoice.taxTotal } // Input Tax Credit (Asset)
                    ]
                });
                invoice.financePosted = true;
                invoice.financePostedAt = new Date();
                invoice.financeReference = invoice.vendorInvoiceNumber;
            } catch (finError) {
                return res.status(400).json({ message: "Invoice approved, but finance posting failed", error: finError.message });
            }
        }

        await invoice.save();
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ message: "Error approving Purchase Invoice", error: error.message });
    }
};

exports.rejectInvoice = async (req, res) => {
    try {
        const invoice = await PurchaseInvoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        if (invoice.approvalStatus === "APPROVED") {
            return res.status(400).json({ message: "Approved invoice cannot be rejected (cancel instead)" });
        }

        invoice.approvalStatus = "REJECTED";
        invoice.rejectedBy = req.user.id;
        invoice.rejectedAt = new Date();
        invoice.approvalComments = req.body?.reason || req.body?.comments || "";
        await invoice.save();

        res.json(invoice);
    } catch (error) {
        res.status(400).json({ message: "Error rejecting Purchase Invoice", error: error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await PurchaseInvoice.find()
            .populate("supplier", "code name contact")
            .populate("poReference", "poNumber")
            .populate("grnReference", "grnNumber")
            .populate("items.item")
            .populate("approvedBy", "name")
            .populate("rejectedBy", "name")
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
            .populate("items.item")
            .populate("approvedBy", "name")
            .populate("rejectedBy", "name");

        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Invoice details", error: error.message });
    }
};
