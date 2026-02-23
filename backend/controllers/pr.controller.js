const PR = require("../models/PR");

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
        res.status(201).json(pr);
    } catch (error) {
        res.status(400).json({ message: "Error creating PR", error: error.message });
    }
};

exports.getPRs = async (req, res) => {
    try {
        let query = {};

        // If not Admin, only show PRs from their department or raised by them
        if (req.user.role !== 'Admin') {
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
            .populate("approver", "name");

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
