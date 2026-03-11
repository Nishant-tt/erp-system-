const express = require("express");
const router = express.Router();
const customerCtrl = require("../controllers/customer.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, customerCtrl.getCustomers);
router.get("/:id", auth, customerCtrl.getCustomerById);
router.post("/", auth, role(["Admin"]), customerCtrl.createCustomer);
router.put("/:id", auth, role(["Admin"]), customerCtrl.updateCustomer);
router.delete("/:id", auth, role(["Admin"]), customerCtrl.deleteCustomer);

module.exports = router;
