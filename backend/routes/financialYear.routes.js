const express = require("express");
const router = express.Router();
const fyCtrl = require("../controllers/financialYear.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", fyCtrl.getFinancialYears);
router.post("/", auth, role(["Super Admin"]), fyCtrl.createFinancialYear);
router.put("/:id", auth, role(["Super Admin"]), fyCtrl.updateFinancialYear);
router.delete("/:id", auth, role(["Super Admin"]), fyCtrl.deleteFinancialYear);

module.exports = router;
