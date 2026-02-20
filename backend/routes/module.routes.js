const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/module.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules with sub-menus
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: List of modules
 */
router.get("/", authMiddleware, moduleController.getModules);

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
 *     responses:
 *       201:
 *         description: Module created
 */
router.post("/", authMiddleware, moduleController.createModule);

/**
 * @swagger
 * /api/modules/menu:
 *   post:
 *     summary: Create a new menu under a module
 *     tags: [Modules]
 *     responses:
 *       201:
 *         description: Menu created
 */
router.post("/menu", authMiddleware, moduleController.createMenu);

module.exports = router;
