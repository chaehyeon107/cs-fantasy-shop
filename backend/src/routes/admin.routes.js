const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const orderController = require("../controllers/order.controller");

const { authGuard, requireRole } = require("../middleware/auth.middleware");

const {
  createItemValidation,
  updateItemValidation,
  itemIdParamValidation,
} = require("../validations/admin.validation");

// ✅ 모든 admin 라우트: 로그인 + ROLE_ADMIN 필수
router.use(authGuard, requireRole("ROLE_ADMIN"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only APIs (ROLE_ADMIN required)
 */

/**
 * @swagger
 * /api/admin/items:
 *   get:
 *     summary: Get all items (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/items", adminController.getItems);

/**
 * @swagger
 * /api/admin/items:
 *   post:
 *     summary: Create a new item (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Legendary Sword"
 *               price:
 *                 type: number
 *                 example: 1000
 *               description:
 *                 type: string
 *                 example: "A powerful fantasy sword"
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation failed
 */
router.post("/items", createItemValidation, adminController.createItem);

/**
 * @swagger
 * /api/admin/items/{id}:
 *   patch:
 *     summary: Update an item (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 */
router.patch("/items/:id", updateItemValidation, adminController.updateItem);

/**
 * @swagger
 * /api/admin/items/{id}:
 *   delete:
 *     summary: Delete an item (Admin)
 *     tags: [Admin]
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
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete("/items/:id", itemIdParamValidation, adminController.deleteItem);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order list retrieved successfully
 */
router.get("/orders", orderController.getAllOrders);

/**
 * @swagger
 * /api/admin/stats/popular-items:
 *   get:
 *     summary: Get popular items ranking
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Popular items retrieved successfully
 */
router.get("/stats/popular-items", adminController.getPopularItems);

/**
 * @swagger
 * /api/admin/stats/top-users:
 *   get:
 *     summary: Get top users by purchase amount
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top users retrieved successfully
 */
router.get("/stats/top-users", adminController.getTopUsers);

/**
 * @swagger
 * /api/admin/stats/orders-summary:
 *   get:
 *     summary: Get order summary by date range
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Order summary retrieved successfully
 */
router.get("/stats/orders-summary", adminController.getOrdersSummary);

module.exports = router;
