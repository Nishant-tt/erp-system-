const express = require("express");
const router = express.Router();
const payCtrl = require("../controllers/customerPayment.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, payCtrl.createPayment);
router.get("/", auth, payCtrl.getPayments);
router.get("/:id", auth, payCtrl.getPaymentById);

module.exports = router;
