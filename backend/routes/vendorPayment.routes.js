const express = require("express");
const router = express.Router();
const payCtrl = require("../controllers/vendorPayment.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, payCtrl.createPayment);
router.get("/", auth, payCtrl.getPayments);

module.exports = router;
