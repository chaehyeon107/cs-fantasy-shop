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

// ✅ 아이템 관리
router.get("/items", adminController.getItems);
router.post("/items", createItemValidation, adminController.createItem);
router.patch("/items/:id", updateItemValidation, adminController.updateItem);
router.delete("/items/:id", itemIdParamValidation, adminController.deleteItem);

// ✅ 관리자 주문 전체 조회
router.get("/orders", orderController.getAllOrders);

router.get("/stats/popular-items", adminController.getPopularItems);
router.get("/stats/top-users", adminController.getTopUsers);
router.get("/stats/orders-summary", adminController.getOrdersSummary);

module.exports = router;
