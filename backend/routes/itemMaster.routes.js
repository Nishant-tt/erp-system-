const express = require("express");
const router = express.Router();
const itemCtrl = require("../controllers/itemMaster.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, itemCtrl.getItems);
router.get("/:id", auth, itemCtrl.getItemById);
router.post("/", auth, role(["Admin"]), itemCtrl.createItem);
router.put("/:id", auth, role(["Admin"]), itemCtrl.updateItem);
router.delete("/:id", auth, role(["Admin"]), itemCtrl.deleteItem);

module.exports = router;
