const express = require("express");
const router = express.Router();
const soCtrl = require("../controllers/salesOrder.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, soCtrl.createSalesOrder);
router.get("/", auth, soCtrl.getSalesOrders);
router.get("/:id", auth, soCtrl.getSalesOrderById);
router.put("/:id/status", auth, soCtrl.updateSalesOrderStatus);

module.exports = router;
