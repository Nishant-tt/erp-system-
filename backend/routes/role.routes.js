const express = require("express");
const router = express.Router();

const roleCtrl = require("../controllers/role.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management APIs
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", auth, role(["Admin"]), roleCtrl.getRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role created
 *       400:
 *         description: Bad request
 */
router.post("/", auth, role(["Admin"]), roleCtrl.createRole);
router.put("/:id", auth, role(["Admin"]), roleCtrl.updateRole);
router.delete("/:id", auth, role(["Admin"]), roleCtrl.deleteRole);

module.exports = router;