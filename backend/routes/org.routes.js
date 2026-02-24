const express = require("express");
const router = express.Router();
const orgCtrl = require("../controllers/org.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/departments", auth, orgCtrl.getDepartments);
router.post("/departments", auth, role(["Super Admin"]), orgCtrl.createDepartment);
router.put("/departments/:id", auth, role(["Super Admin"]), orgCtrl.updateDepartment);
router.delete("/departments/:id", auth, role(["Super Admin"]), orgCtrl.deleteDepartment);

router.get("/teams", auth, orgCtrl.getTeams);
router.post("/teams", auth, role(["Super Admin"]), orgCtrl.createTeam);

module.exports = router;
