// src/routes/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authGuard } = require("../middleware/auth.middleware");

// 로그인 필수
router.use(authGuard);

// 장바구니 → 주문 생성 (결제 PAID 고정)
router.post("/", orderController.createOrderFromCart);

// 내 주문 목록
router.get("/", orderController.getMyOrders);

// 내 특정 주문 상세
router.get("/:id", orderController.getMyOrderById);

module.exports = router;
