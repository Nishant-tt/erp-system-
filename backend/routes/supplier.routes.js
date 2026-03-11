const express = require("express");
const router = express.Router();
const supplierCtrl = require("../controllers/supplier.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, supplierCtrl.getSuppliers);
router.get("/:id", auth, supplierCtrl.getSupplierById);
router.post("/", auth, role(["Admin"]), supplierCtrl.createSupplier);
router.put("/:id", auth, role(["Admin"]), supplierCtrl.updateSupplier);
router.delete("/:id", auth, role(["Admin"]), supplierCtrl.deleteSupplier);

module.exports = router;
