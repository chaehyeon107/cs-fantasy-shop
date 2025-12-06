const { validationResult } = require("express-validator");
const axios = require("axios");
const bcrypt = require("bcrypt");
const apiResponse = require("../utils/apiResponse");
const {
  loginUser,              // email로 유저 조회 (Prisma)
  createUser,             // 회원 생성 (Prisma)
  refreshTokens,          // 리프레시 토큰 재발급
  revokeRefreshToken,     // 리프레시 토큰 무효화
  issueTokensForUser,     // Access+Refresh 발급
} = require("../services/auth.service");
const { sendError } = require("../utils/errorResponse");
const { initFirebase } = require("../config/firebase");
const { prisma } = require("../config/prisma");

//
// 공통: Validation 에러 처리
//
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, req, "VALIDATION_FAILED", {
      details: errors.array(),
    });
  }
  return null;
}

/**
 * 회원가입
 * POST /api/auth/register
 * Body:
 *   - email: string
 *   - password: string
 *   - nickname: string
 */

exports.register = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { email, password, nickname } = req.body;

    // 1) 이메일 중복
    const exists = await prisma.user.findUnique({
      where: { email },
    });
    if (exists) {
      return sendError(res, req, "AUTH_EMAIL_EXISTS");
    }

    // 2) 비밀번호 해시
    const hashed = await bcrypt.hash(password, 10);

    // 3) Prisma 기반 생성
    const user = await createUser({
      email,
      password: hashed,
      nickname,
      provider: "local",
      role: "ROLE_USER",
    });

    return apiResponse.success(
      res,
      {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * 이메일 로그인
 * POST /api/auth/login
 * Body:
 *   - email: string
 *   - password: string
 */

exports.login = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { email, password } = req.body;

    // 1) 유저 조회 (Prisma)
    const user = await loginUser(email);
    if (!user) {
      return sendError(res, req, "AUTH_INVALID_CREDENTIALS");
    }

    // 2) 비밀번호 비교
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return sendError(res, req, "AUTH_INVALID_CREDENTIALS");
    }

    // 3) Access/Refresh 발급
    const result = await issueTokensForUser(user);

    return apiResponse.success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * 토큰 재발급
 * POST /api/auth/refresh
 * Body:
 *   - refreshToken: string
 */

exports.refresh = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { refreshToken } = req.body;

    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      return sendError(res, req, "AUTH_REFRESH_INVALID");
    }

    return apiResponse.success(res, tokens, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * 로그아웃 (Refresh Token 무효화)
 * POST /api/auth/logout
 * Auth: Access Token 필요
 * Body:
 *   - refreshToken: string
 */

exports.logout = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { refreshToken } = req.body;

    if (!req.user) {
      return sendError(res, req, "AUTH_INVALID_INPUT", {
        details: { message: "User not in request context" },
      });
    }

    await revokeRefreshToken(req.user.id, refreshToken);

    return apiResponse.success(res, { loggedOut: true }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * 내 정보 조회
 * GET /api/auth/me
 * Auth: Access Token 필요
 * Response:
 *   - id, email, nickname, role, createdAt
 */

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (!user) {
      return sendError(res, req, "USER_NOT_FOUND");
    }

    return apiResponse.success(res, {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 카카오 소셜 로그인
 * POST /api/auth/kakao
 * Body:
 *   - accessToken: string  (카카오 OAuth Access Token)
 * Description:
 *   - Kakao API로 사용자 검증 후 Access/Refresh Token 발급
 */

exports.kakaoLogin = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { accessToken } = req.body;

    // 1) Kakao 사용자 정보
    const kakaoRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoUser = kakaoRes.data;
    const kakaoId = kakaoUser.id;
    const kakaoAccount = kakaoUser.kakao_account || {};

    const email = kakaoAccount.email;
    const nickname =
      (kakaoAccount.profile && kakaoAccount.profile.nickname) ||
      `kakao_${kakaoId}`;

    if (!email) {
      return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
        details: { message: "Kakao email not provided" },
      });
    }

    // 2) 유저 조회 or 생성
    let user = await prisma.user.findFirst({
      where: {
        provider: "kakao",
        providerId: String(kakaoId),
      },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(`kakao_${kakaoId}_dummy`, 10);

      user = await prisma.user.create({
        data: {
          email,
          password: dummyPassword,
          nickname,
          provider: "kakao",
          providerId: String(kakaoId),
          role: "ROLE_USER",
        },
      });
    }

    // 3) JWT 발급
    const result = await issueTokensForUser(user);

    return apiResponse.success(res, result, 200);
  } catch (err) {
    console.error("Kakao login error:", err.response?.data || err.message);
    return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
      details: err.response?.data || { message: err.message },
    });
  }
};

/**
 * Firebase 소셜 로그인
 * POST /api/auth/firebase
 * Body:
 *   - idToken: string  (Firebase Auth ID Token)
 * Description:
 *   - Firebase Admin SDK로 ID Token 검증 후 Access/Refresh Token 발급
 */

exports.firebaseLogin = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { idToken } = req.body;

    const admin = initFirebase();

    // 1) Firebase 토큰 검증
    const decoded = await admin.auth().verifyIdToken(idToken);

    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || `firebase_${uid}`;

    if (!email) {
      return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
        details: { message: "Firebase token has no email" },
      });
    }

    // 2) 유저 조회 or 생성
    let user = await prisma.user.findFirst({
      where: {
        provider: "firebase",
        providerId: uid,
      },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(`firebase_${uid}_dummy`, 10);

      user = await prisma.user.create({
        data: {
          email,
          password: dummyPassword,
          nickname: name,
          provider: "firebase",
          providerId: uid,
          role: "ROLE_USER",
        },
      });
    }

    // 3) JWT 발급
    const result = await issueTokensForUser(user);

    return apiResponse.success(res, result, 200);
  } catch (err) {
    console.error("Firebase login error:", err);
    return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
      details: { message: err.message },
    });
  }
};
