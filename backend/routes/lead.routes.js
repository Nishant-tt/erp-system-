const express = require("express");
const router = express.Router();
const leadCtrl = require("../controllers/lead.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, leadCtrl.createLead);
router.get("/", auth, leadCtrl.getLeads);
router.get("/:id", auth, leadCtrl.getLeadById);
router.put("/:id", auth, leadCtrl.updateLead);

module.exports = router;
