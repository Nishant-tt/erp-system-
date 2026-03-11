const express = require("express");
const router = express.Router();
const fyCtrl = require("../controllers/financialYear.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", fyCtrl.getFinancialYears);
router.post("/", auth, role(["Admin"]), fyCtrl.createFinancialYear);
router.put("/:id", auth, role(["Admin"]), fyCtrl.updateFinancialYear);
router.delete("/:id", auth, role(["Admin"]), fyCtrl.deleteFinancialYear);

module.exports = router;
