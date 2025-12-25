// src/routes/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authGuard } = require("../middleware/auth.middleware");

// 로그인 필수
router.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order APIs (Login required)
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from cart
 *     description: Create a new order using items in the cart (payment status is PAID)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid cart or order creation failed
 */
router.post("/", orderController.createOrderFromCart);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get my order detail
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Order detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get("/:id", orderController.getMyOrderById);

module.exports = router;
