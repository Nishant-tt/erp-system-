const express = require("express");
const router = express.Router();
const invCtrl = require("../controllers/purchaseInvoice.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, invCtrl.createInvoice);
router.get("/", auth, invCtrl.getInvoices);
router.get("/:id", auth, invCtrl.getInvoiceById);

module.exports = router;
