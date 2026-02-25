const express = require("express");
const router = express.Router();
const companyCtrl = require("../controllers/company.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, companyCtrl.getCompany);
router.put("/", auth, role(["Super Admin"]), companyCtrl.updateCompany);

module.exports = router;
