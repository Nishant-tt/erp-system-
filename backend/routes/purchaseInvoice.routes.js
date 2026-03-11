const express = require("express");
const router = express.Router();
const invCtrl = require("../controllers/purchaseInvoice.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role(["Admin", "Accounts Payable"]), invCtrl.createInvoice);
router.get("/", auth, invCtrl.getInvoices);
router.get("/:id", auth, invCtrl.getInvoiceById);

// Approval / review actions
router.patch("/:id/approve", auth, role(["Admin", "Accounts Payable", "Finance Head", "Director", "GM"]), invCtrl.approveInvoice);
router.patch("/:id/reject", auth, role(["Admin", "Accounts Payable", "Finance Head", "Director", "GM"]), invCtrl.rejectInvoice);

module.exports = router;
