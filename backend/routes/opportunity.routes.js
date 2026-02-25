const express = require("express");
const router = express.Router();
const oppCtrl = require("../controllers/opportunity.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, oppCtrl.createOpportunity);
router.get("/", auth, oppCtrl.getOpportunities);
router.get("/:id", auth, oppCtrl.getOpportunityById);
router.put("/:id", auth, oppCtrl.updateOpportunity);

module.exports = router;
