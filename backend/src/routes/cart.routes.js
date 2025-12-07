const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { authGuard } = require("../middleware/auth.middleware");

router.use(authGuard);

// ✅ 담기
router.post("/", cartController.addToCart);

// ✅ 조회
router.get("/", cartController.getMyCart);

// ✅ 수량 수정 (PATCH /api/cart)
router.patch("/", cartController.updateCart);

// ✅ 개별 삭제 (DELETE /api/cart)
router.delete("/", cartController.deleteCart);

// ✅ 전체 삭제
router.delete("/clear", cartController.clearCart);

module.exports = router;
