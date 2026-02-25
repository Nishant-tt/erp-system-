const express = require("express");
const router = express.Router();
const customerCtrl = require("../controllers/customer.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, customerCtrl.getCustomers);
router.get("/:id", auth, customerCtrl.getCustomerById);
router.post("/", auth, role(["Super Admin"]), customerCtrl.createCustomer);
router.put("/:id", auth, role(["Super Admin"]), customerCtrl.updateCustomer);
router.delete("/:id", auth, role(["Super Admin"]), customerCtrl.deleteCustomer);

module.exports = router;
