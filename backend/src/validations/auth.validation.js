// backend/src/validations/auth.validation.js
const { body } = require("express-validator");

// 회원가입 DTO
exports.registerValidation = [
  body("email")
    .isEmail()
    .withMessage("INVALID_EMAIL")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("PASSWORD_TOO_SHORT")
    .trim(),
  body("nickname")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("NICKNAME_LENGTH_INVALID"),
];

// 로그인 DTO
exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("INVALID_EMAIL")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("PASSWORD_REQUIRED")
    .trim(),
];

// 토큰 재발급 DTO
exports.refreshValidation = [
  body("refreshToken")
    .isString()
    .notEmpty()
    .withMessage("REFRESH_TOKEN_REQUIRED")
    .trim(),
];

// 로그아웃 DTO
exports.logoutValidation = [
  body("refreshToken")
    .isString()
    .notEmpty()
    .withMessage("REFRESH_TOKEN_REQUIRED")
    .trim(),
];

// Kakao 소셜 로그인 DTO (Authorization Code 기반)
exports.kakaoLoginValidation = [
  body("code")
    .isString()
    .notEmpty()
    .withMessage("KAKAO_CODE_REQUIRED")
    .trim(),
];

// Firebase 소셜 로그인 DTO
exports.firebaseLoginValidation = [
  body("idToken")
    .isString()
    .notEmpty()
    .withMessage("FIREBASE_ID_TOKEN_REQUIRED")
    .trim(),
];
