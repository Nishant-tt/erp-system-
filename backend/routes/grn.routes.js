const express = require("express");
const router = express.Router();
const grnCtrl = require("../controllers/grn.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, grnCtrl.createGRN);
router.get("/", auth, grnCtrl.getGRNs);
router.get("/:id", auth, grnCtrl.getGRNById);
router.patch("/:id/verify", auth, role(["Admin", "Manager"]), grnCtrl.verifyGRN);
router.patch("/:id/reject", auth, role(["Admin", "Manager"]), grnCtrl.rejectGRN);

module.exports = router;
