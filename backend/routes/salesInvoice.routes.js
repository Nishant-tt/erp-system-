const express = require("express");
const router = express.Router();
const invCtrl = require("../controllers/salesInvoice.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, invCtrl.createInvoice);
router.get("/", auth, invCtrl.getInvoices);
router.get("/:id", auth, invCtrl.getInvoiceById);
router.put("/:id", auth, invCtrl.updateInvoice);
router.delete("/:id", auth, invCtrl.deleteInvoice);

module.exports = router;
