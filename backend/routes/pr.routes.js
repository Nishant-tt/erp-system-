const express = require("express");
const router = express.Router();
const prCtrl = require("../controllers/pr.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, prCtrl.getPRs);
router.get("/:id", auth, prCtrl.getPRById);
router.post("/", auth, prCtrl.createPR);
router.put("/:id", auth, auth, prCtrl.updatePR);
router.patch("/:id/submit", auth, prCtrl.submitPR);
router.patch("/:id/approve", auth, role(["Admin", "Manager"]), prCtrl.approvePR);
router.patch("/:id/reject", auth, role(["Admin", "Manager"]), prCtrl.rejectPR);

module.exports = router;
