const express = require("express");
const router = express.Router();
const poCtrl = require("../controllers/po.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role(["Admin", "Manager"]), poCtrl.createPO);
router.post("/from-quotation/:quotationId", auth, role(["Admin"]), poCtrl.createPOFromQuotation);
router.get("/", auth, poCtrl.getPOs);
router.get("/:id", auth, poCtrl.getPOById);
router.put("/:id/status", auth, role(["Admin"]), poCtrl.updatePOStatus);

module.exports = router;
