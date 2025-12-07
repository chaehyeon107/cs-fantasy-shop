const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// ✅ 여기 핵심: authGuard를 정확히 구조분해로 가져온다
const { authGuard } = require("../middleware/auth.middleware");

// ✅ 로그인 필수
router.use(authGuard);

router.post("/", cartController.addToCart);        // 담기
router.get("/", cartController.getMyCart);         // 조회
router.patch("/:id", cartController.updateCart);  // 수량 수정
router.delete("/:id", cartController.deleteCart); // 개별 삭제
router.delete("/", cartController.clearCart);     // 전체 삭제

module.exports = router;
