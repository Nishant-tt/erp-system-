const PR = require("../models/PR");
const { buildPdfBuffer, buildDocxBuffer } = require("../utils/exportDocs");

exports.createPR = async (req, res) => {
    try {
        const prData = {
            ...req.body,
            requestedBy: req.user.id,
            department: req.body.department || req.user.department
        };

        if (!prData.department) {
            return res.status(400).json({ message: "User department is not configured. Please contact admin." });
        }
        const pr = await PR.create(prData);
        const populatedPR = await PR.findById(pr._id)
            .populate("requestedBy", "name email")
            .populate("department", "name code")
            .populate("vendorSuggestion", "code name contact")
            .populate("items.item");
        res.status(201).json(populatedPR);
    } catch (error) {
        res.status(400).json({ message: "Error creating PR", error: error.message });
    }
};

exports.getPRs = async (req, res) => {
    try {
        let query = {};
        // Admin sees all PRs
        if (req.user.role === "Admin") {
            query = {};
        } else {
            // Managers and Users
            query = {
                $or: [
                    { requestedBy: req.user.id },
                    { department: req.user.department }
                ]
            };
        }

        const prs = await PR.find(query)
            .populate("requestedBy", "name email")
            .populate("department", "name code")
            .populate("approver", "name")
            .populate("vendorSuggestion", "code name contact")
            .populate("items.item")
            .sort({ createdAt: -1 });

        res.json(prs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching PRs", error: error.message });
    }
};

exports.getPRById = async (req, res) => {
    try {
        const pr = await PR.findById(req.params.id)
            .populate("requestedBy", "name email")
            .populate("department", "name code")
            .populate("approver", "name")
            .populate("vendorSuggestion", "code name contact")
            .populate("items.item");

        if (!pr) return res.status(404).json({ message: "PR not found" });
        res.json(pr);
    } catch (error) {
        res.status(500).json({ message: "Error fetching PR details", error: error.message });
    }
};

exports.updatePR = async (req, res) => {
    try {
        const pr = await PR.findById(req.params.id);
        if (!pr) return res.status(404).json({ message: "PR not found" });

        // Only allow updates if it's in DRAFT status
        if (pr.status !== 'DRAFT') {
            return res.status(400).json({ message: "Only drafts can be updated" });
        }

        const updatedPR = await PR.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPR);
    } catch (error) {
        res.status(400).json({ message: "Error updating PR", error: error.message });
    }
};

exports.submitPR = async (req, res) => {
    try {
        const pr = await PR.findById(req.params.id);
        if (!pr) return res.status(404).json({ message: "PR not found" });

        if (pr.status !== 'DRAFT') {
            return res.status(400).json({ message: "Only drafts can be submitted" });
        }

        pr.status = 'PENDING_APPROVAL';
        await pr.save();
        res.json(pr);
    } catch (error) {
        res.status(400).json({ message: "Error submitting PR", error: error.message });
    }
};

exports.approvePR = async (req, res) => {
    try {
        const pr = await PR.findById(req.params.id);
        if (!pr) return res.status(404).json({ message: "PR not found" });

        if (pr.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({ message: "PR is not pending approval" });
        }

        pr.status = 'APPROVED';
        pr.approver = req.user.id;
        pr.approvalDate = new Date();
        pr.comments = req.body.comments;

        await pr.save();
        res.json(pr);
    } catch (error) {
        res.status(400).json({ message: "Error approving PR", error: error.message });
    }
};

exports.rejectPR = async (req, res) => {
    try {
        const pr = await PR.findById(req.params.id);
        if (!pr) return res.status(404).json({ message: "PR not found" });

        if (pr.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({ message: "PR is not pending approval" });
        }

        pr.status = 'REJECTED';
        pr.approver = req.user.id;
        pr.reasonForRejection = req.body.reason;

        await pr.save();
        res.json(pr);
    } catch (error) {
        res.status(400).json({ message: "Error rejecting PR", error: error.message });
    }
};

exports.exportPR = async (req, res) => {
    try {
        const format = String(req.params.format || "pdf").toLowerCase();
        if (!["pdf", "docx"].includes(format)) {
            return res.status(400).json({ message: "Invalid export format. Use pdf or docx." });
        }

        const pr = await PR.findById(req.params.id)
            .populate("requestedBy", "name email")
            .populate("department", "name code")
            .populate("approver", "name")
            .populate("vendorSuggestion", "code name contact")
            .populate("items.item");

        if (!pr) return res.status(404).json({ message: "PR not found" });

        const title = `Purchase Requisition ${pr.prNumber || ""}`.trim();
        const meta = [
            ["PR Number", pr.prNumber],
            ["PR Date", pr.prDate ? new Date(pr.prDate).toLocaleDateString("en-IN") : ""],
            ["Department", pr.department?.name || ""],
            ["Requester", pr.requestedBy?.name || ""],
            ["Required Date", pr.requiredDate ? new Date(pr.requiredDate).toLocaleDateString("en-IN") : ""],
            ["Budget Code", pr.budgetCode || ""],
            ["Cost Center", pr.costCenter || ""],
            ["Priority", pr.priority || ""],
            ["Vendor Suggestion", pr.vendorSuggestion?.name || ""],
            ["Approval Status", pr.status || ""],
        ];

        const columns = ["Item Code", "Item Description", "Qty", "UOM", "Est Unit Cost", "Line Total"];
        const rows = (pr.items || []).map((it) => ([
            it.item?.itemCode || "",
            it.description || it.item?.itemName || "",
            it.quantity ?? "",
            it.unit || it.item?.uom || "",
            it.estimatedUnitCost ?? "",
            it.totalCost ?? (Number(it.quantity || 0) * Number(it.estimatedUnitCost || 0)),
        ]));

        let buffer;
        let contentType;
        let filename;
        if (format === "pdf") {
            buffer = await buildPdfBuffer({ title, meta, columns, rows });
            contentType = "application/pdf";
            filename = `${pr.prNumber || "PR"}.pdf`;
        } else {
            buffer = await buildDocxBuffer({ title, meta, columns, rows });
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            filename = `${pr.prNumber || "PR"}.docx`;
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        res.status(400).json({ message: "Error exporting PR", error: error.message });
    }
};
