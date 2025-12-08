const { validationResult } = require("express-validator");
const axios = require("axios");
const bcrypt = require("bcrypt");
const apiResponse = require("../utils/apiResponse");
const {
  loginUser,
  createUser,
  refreshTokens,
  revokeRefreshToken,
  issueTokensForUser,
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

/* =====================================================
   ✅ ✅ ✅ [추가] 카카오 OAuth 콜백 (가장 중요)
   GET /api/auth/kakao/callback
===================================================== */
exports.kakaoCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return sendError(res, req, "AUTH_INVALID_INPUT", {
      details: { message: "Authorization code not found" },
    });
  }

  try {
    // 1) code → access_token
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenRes.data;

    // 2) 카카오 사용자 정보 조회
    const kakaoRes = await axios.get(
      "https://kapi.kakao.com/v2/user/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const kakaoUser = kakaoRes.data;
    const kakaoId = kakaoUser.id?.toString();
    const profile = kakaoUser.kakao_account?.profile || {};

    const nickname =
      profile.nickname || `kakao_${kakaoId || "user"}`;

    const syntheticEmail = `kakao_${kakaoId}@kakao.local`;

    let user = await prisma.user.findFirst({
      where: {
        provider: "kakao",
        providerId: kakaoId,
      },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(
        `kakao_${kakaoId}_dummy`,
        10
      );

      user = await prisma.user.create({
        data: {
          email: syntheticEmail,
          password: dummyPassword,
          nickname,
          provider: "kakao",
          providerId: kakaoId,
          role: "ROLE_USER",
        },
      });
    }

    const result = await issueTokensForUser(user);
    return apiResponse.success(res, result, 200);
  } catch (err) {
    console.error(
      "Kakao Callback Error:",
      err.response?.data || err.message
    );
    return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
      details: err.response?.data || { message: err.message },
    });
  }
};

/* =========================
   ✅ ✅ ✅ 기존 로컬 회원가입
========================= */
exports.register = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { email, password, nickname } = req.body;

    const exists = await prisma.user.findUnique({
      where: { email },
    });
    if (exists) return sendError(res, req, "AUTH_EMAIL_EXISTS");

    const hashed = await bcrypt.hash(password, 10);

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

/* =========================
   ✅ ✅ ✅ 기존 로컬 로그인
========================= */
exports.login = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { email, password } = req.body;

    const user = await loginUser(email);
    if (!user) return sendError(res, req, "AUTH_INVALID_CREDENTIALS");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendError(res, req, "AUTH_INVALID_CREDENTIALS");

    const result = await issueTokensForUser(user);
    return apiResponse.success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/* =========================
   ✅ ✅ ✅ 기존 토큰 재발급
========================= */
exports.refresh = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { refreshToken } = req.body;

    const tokens = await refreshTokens(refreshToken);
    if (!tokens) return sendError(res, req, "AUTH_REFRESH_INVALID");

    return apiResponse.success(res, tokens, 200);
  } catch (err) {
    next(err);
  }
};

/* =========================
   ✅ ✅ ✅ 기존 로그아웃
========================= */
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

/* =========================
   ✅ ✅ ✅ 기존 내 정보 조회
========================= */
exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (!user) return sendError(res, req, "USER_NOT_FOUND");

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

/* =========================
   ✅ ✅ ✅ 기존 POST 카카오 로그인 (프론트 방식)
========================= */
exports.kakaoLogin = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const code = req.body?.code || req.query?.code;

    if (!code) {
      return sendError(res, req, "AUTH_INVALID_INPUT", {
        details: { message: "Kakao authorization code not found" },
      });
    }

    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code,
          
          ...(process.env.KAKAO_CLIENT_SECRET && {
            client_secret: process.env.KAKAO_CLIENT_SECRET,
          }),
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );


    const { access_token } = tokenRes.data;

    const kakaoRes = await axios.get(
      "https://kapi.kakao.com/v2/user/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const kakaoUser = kakaoRes.data;
    const kakaoId = kakaoUser.id?.toString();
    const profile = kakaoUser.kakao_account?.profile || {};

    const nickname =
      profile.nickname || `kakao_${kakaoId || "user"}`;

    const syntheticEmail = `kakao_${kakaoId}@kakao.local`;

    let user = await prisma.user.findFirst({
      where: {
        provider: "kakao",
        providerId: kakaoId,
      },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(
        `kakao_${kakaoId}_dummy`,
        10
      );

      user = await prisma.user.create({
        data: {
          email: syntheticEmail,
          password: dummyPassword,
          nickname,
          provider: "kakao",
          providerId: kakaoId,
          role: "ROLE_USER",
        },
      });
    }

    const result = await issueTokensForUser(user);
    return apiResponse.success(res, result, 200);
  } catch (err) {
    console.error(
      "Kakao login error:",
      err.response?.data || err.message
    );
    return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
      details: err.response?.data || { message: err.message },
    });
  }
};

/* =========================
   ✅ ✅ ✅ 기존 Firebase 로그인
========================= */
exports.firebaseLogin = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { idToken } = req.body;

    const admin = initFirebase();
    const decoded = await admin.auth().verifyIdToken(idToken);

    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || `firebase_${uid}`;

    if (!email) {
      return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
        details: { message: "Firebase token has no email" },
      });
    }

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

    const result = await issueTokensForUser(user);
    return apiResponse.success(res, result, 200);
  } catch (err) {
    console.error("Firebase login error:", err);
    return sendError(res, req, "SOCIAL_LOGIN_FAILED", {
      details: { message: err.message },
    });
  }
};
