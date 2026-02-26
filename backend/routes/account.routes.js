const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");
// Assuming some auth middleware exists, but for now making it open or simplified
// const auth = require("../middleware/auth"); 

router.get("/", accountController.getAccounts);
router.post("/", accountController.createAccount);
router.put("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

module.exports = router;
