const { body } = require("express-validator");

// 회원가입 DTO
exports.registerValidation = [
  body("email")
    .isEmail()
    .withMessage("INVALID_EMAIL"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("PASSWORD_TOO_SHORT"),
  body("nickname")
    .isLength({ min: 1, max: 20 })
    .withMessage("NICKNAME_LENGTH_INVALID"),
];

// 로그인 DTO
exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("INVALID_EMAIL"),
  body("password")
    .notEmpty()
    .withMessage("PASSWORD_REQUIRED"),
];

// 토큰 재발급 DTO
exports.refreshValidation = [
  body("refreshToken")
    .notEmpty()
    .withMessage("REFRESH_TOKEN_REQUIRED"),
];

// 로그아웃 DTO
exports.logoutValidation = [
  body("refreshToken")
    .notEmpty()
    .withMessage("REFRESH_TOKEN_REQUIRED"),
];

// Kakao 소셜 로그인 DTO
exports.kakaoLoginValidation = [
  body("accessToken")
    .notEmpty()
    .withMessage("KAKAO_ACCESS_TOKEN_REQUIRED"),
];

// Firebase 소셜 로그인 DTO
exports.firebaseLoginValidation = [
  body("idToken")
    .notEmpty()
    .withMessage("FIREBASE_ID_TOKEN_REQUIRED"),
];