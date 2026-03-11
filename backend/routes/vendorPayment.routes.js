const express = require("express");
const router = express.Router();
const payCtrl = require("../controllers/vendorPayment.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role(["Admin", "Finance Head", "Director", "GM"]), payCtrl.createPayment);
router.get("/", auth, payCtrl.getPayments);

module.exports = router;
