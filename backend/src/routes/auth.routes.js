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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               nickname:
 *                 type: string
 *                 example: fantasyUser
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 */
router.post("/register", registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login (JWT Access & Refresh Token issued)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Reissue Access Token using Refresh Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Access token reissued
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", refreshValidation, authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout (invalidate Access & Refresh tokens)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", authGuard, logoutValidation, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get my profile (token verification)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authGuard, authController.me);

/**
 * @swagger
 * /api/auth/kakao/callback:
 *   get:
 *     summary: Kakao OAuth callback (redirect URI)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Kakao authorization code page
 */
router.get("/kakao/callback", authController.kakaoCallback);

/**
 * @swagger
 * /api/auth/kakao:
 *   post:
 *     summary: Kakao social login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "qc-sRZzUP_D4Jsgmzl5O5ag..."
 *     responses:
 *       200:
 *         description: Kakao login successful
 */
router.post("/kakao", kakaoLoginValidation, authController.kakaoLogin);

/**
 * @swagger
 * /api/auth/firebase:
 *   post:
 *     summary: Firebase social login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
 *     responses:
 *       200:
 *         description: Firebase login successful
 */
router.post("/firebase", firebaseLoginValidation, authController.firebaseLogin);

module.exports = router;
