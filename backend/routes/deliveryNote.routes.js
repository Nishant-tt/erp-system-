const express = require("express");
const router = express.Router();
const dnCtrl = require("../controllers/deliveryNote.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, dnCtrl.createDeliveryNote);
router.get("/", auth, dnCtrl.getDeliveryNotes);
router.get("/:id", auth, dnCtrl.getDeliveryNoteById);

module.exports = router;
