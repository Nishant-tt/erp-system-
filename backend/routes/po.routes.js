const express = require("express");
const router = express.Router();
const poCtrl = require("../controllers/po.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role(["Admin", "Super Admin", "Manager"]), poCtrl.createPO);
router.get("/", auth, poCtrl.getPOs);
router.get("/:id", auth, poCtrl.getPOById);
router.put("/:id/status", auth, role(["Admin", "Super Admin"]), poCtrl.updatePOStatus);

module.exports = router;
