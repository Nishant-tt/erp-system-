const express = require("express");
const router = express.Router();
const journalEntryController = require("../controllers/journalEntry.controller");

router.get("/", journalEntryController.getEntries);
router.get("/trial-balance", journalEntryController.getTrialBalance);
router.get("/:id", journalEntryController.getEntryById);
router.post("/", journalEntryController.createEntry);

module.exports = router;
