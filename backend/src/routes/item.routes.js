// backend/src/routes/item.routes.js
const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Public item APIs
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get public item list
 *     tags: [Item]
 *     responses:
 *       200:
 *         description: Item list retrieved successfully
 */
router.get("/", itemController.listItems);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item detail
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Item detail retrieved successfully
 *       404:
 *         description: Item not found
 */
router.get("/:id", itemController.getItemDetail);

module.exports = router;
