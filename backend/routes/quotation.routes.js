const express = require("express");
const router = express.Router();
const quoteCtrl = require("../controllers/quotation.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, quoteCtrl.createQuotation);
router.get("/", auth, quoteCtrl.getQuotations);
router.get("/:id", auth, quoteCtrl.getQuotationById);
router.put("/:id/status", auth, quoteCtrl.updateQuotationStatus);

module.exports = router;
