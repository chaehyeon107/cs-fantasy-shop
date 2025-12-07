const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware); // ✅ 로그인 필수

router.post("/", cartController.addToCart);        // 담기
router.get("/", cartController.getMyCart);         // 조회
router.patch("/:id", cartController.updateCart);  // 수량 수정
router.delete("/:id", cartController.deleteCart); // 개별 삭제
router.delete("/", cartController.clearCart);     // 전체 삭제

module.exports = router;
