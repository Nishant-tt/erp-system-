const express = require("express");
const router = express.Router();
const grnCtrl = require("../controllers/grn.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, grnCtrl.createGRN);
router.get("/", auth, grnCtrl.getGRNs);
router.get("/:id", auth, grnCtrl.getGRNById);

module.exports = router;
