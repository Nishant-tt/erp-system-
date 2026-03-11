const express = require("express");
const router = express.Router();

const pqCtrl = require("../controllers/procurementQuotation.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, pqCtrl.getQuotations);
router.get("/:id", auth, pqCtrl.getQuotationById);

// Create from APPROVED PR (Admin creates quotation after PR approval)
router.post("/from-pr/:prId", auth, role(["Admin"]), pqCtrl.createFromPR);

router.patch("/:id/submit", auth, role(["Admin"]), pqCtrl.submitForApproval);
router.patch("/:id/approve", auth, role(["Admin", "Manager"]), pqCtrl.approveQuotation);
router.patch("/:id/reject", auth, role(["Admin", "Manager"]), pqCtrl.rejectQuotation);

// After manager approval, mark as sent to suppliers (email integration can be added later)
router.patch("/:id/send", auth, role(["Admin"]), pqCtrl.markSentToSuppliers);

module.exports = router;

