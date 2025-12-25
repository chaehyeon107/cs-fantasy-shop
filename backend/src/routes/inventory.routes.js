// src/routes/inventory.routes.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const { authGuard } = require("../middleware/auth.middleware");

// ✅ 모든 Inventory API는 로그인 필요
router.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: User inventory APIs (Login required)
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get my inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", inventoryController.getMyInventory);

module.exports = router;
