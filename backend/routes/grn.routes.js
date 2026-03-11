const express = require("express");
const router = express.Router();
const grnCtrl = require("../controllers/grn.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role(["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"]), grnCtrl.createGRN);
router.get("/", auth, grnCtrl.getGRNs);
router.get("/:id", auth, grnCtrl.getGRNById);
router.get("/:id/export/:format", auth, grnCtrl.exportGRN);
router.patch("/:id/verify", auth, role(["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"]), grnCtrl.verifyGRN);
router.patch("/:id/reject", auth, role(["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"]), grnCtrl.rejectGRN);

module.exports = router;
