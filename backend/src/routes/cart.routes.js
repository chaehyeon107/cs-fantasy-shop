const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { authGuard } = require("../middleware/auth.middleware");

// ✅ 모든 Cart API는 로그인 필요
router.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart APIs (Login required)
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - quantity
 *             properties:
 *               itemId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart
 *       401:
 *         description: Unauthorized
 */
router.post("/", cartController.addToCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get my cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", cartController.getMyCart);

/**
 * @swagger
 * /api/cart:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - quantity
 *             properties:
 *               itemId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Item not found in cart
 */
router.patch("/", cartController.updateCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Cart item removed
 *       404:
 *         description: Item not found in cart
 */
router.delete("/", cartController.deleteCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear all cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/clear", cartController.clearCart);

module.exports = router;
