const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { authGuard } = require("../middleware/auth.middleware");
const {
  registerValidation,
  loginValidation,
  refreshValidation,
  logoutValidation,
  kakaoLoginValidation,
  firebaseLoginValidation,
} = require("../validations/auth.validation");

// 회원가입
router.post("/register", registerValidation, authController.register);

// 로그인 (JWT Access/Refresh 발급)
router.post("/login", loginValidation, authController.login);

// 토큰 재발급
router.post("/refresh", refreshValidation, authController.refresh);

// 로그아웃 (Access + Refresh 필요)
router.post("/logout", authGuard, logoutValidation, authController.logout);

// 내 정보 조회 (토큰 검증용)
router.get("/me", authGuard, authController.me);

// Kakao 소셜 로그인
router.post("/kakao", kakaoLoginValidation, authController.kakaoLogin);

// Firebase 소셜 로그인
router.post("/firebase", firebaseLoginValidation, authController.firebaseLogin);

module.exports = router;
