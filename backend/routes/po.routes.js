const express = require("express");
const router = express.Router();
const poCtrl = require("../controllers/po.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// Create (procurement)
router.post("/", auth, role(["Admin", "Manager", "Purchase Manager"]), poCtrl.createPO);
router.post("/from-quotation/:quotationId", auth, role(["Admin", "Purchase Manager"]), poCtrl.createPOFromQuotation);

// Approval workflow
router.patch("/:id/submit", auth, role(["Admin", "Manager"]), poCtrl.submitPOForApproval);
// Approver role is decided dynamically by PO value; controller enforces required roles
router.patch("/:id/approve", auth, role(["Admin", "Manager", "Purchase Manager", "Finance Head", "Director", "GM"]), poCtrl.approvePO);
router.patch("/:id/reject", auth, role(["Admin", "Manager", "Purchase Manager", "Finance Head", "Director", "GM"]), poCtrl.rejectPO);

// Read
router.get("/", auth, poCtrl.getPOs);
router.get("/:id", auth, poCtrl.getPOById);
router.get("/:id/export/:format", auth, poCtrl.exportPO);

// Operational status updates (admin only)
router.put("/:id/status", auth, role(["Admin"]), poCtrl.updatePOStatus);

module.exports = router;
