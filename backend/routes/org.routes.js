const express = require("express");
const router = express.Router();
const orgCtrl = require("../controllers/org.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/departments", auth, orgCtrl.getDepartments);
router.post("/departments", auth, role(["Admin"]), orgCtrl.createDepartment);
router.put("/departments/:id", auth, role(["Admin"]), orgCtrl.updateDepartment);
router.delete("/departments/:id", auth, role(["Admin"]), orgCtrl.deleteDepartment);

router.get("/teams", auth, orgCtrl.getTeams);
router.post("/teams", auth, role(["Admin"]), orgCtrl.createTeam);

module.exports = router;
