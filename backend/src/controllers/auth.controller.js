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
const { getKakaoTokens, getKakaoUser } = require("../services/kakao.service");

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

// Kakao 계정 정보로 Prisma User 찾거나 없으면 생성
async function findOrCreateKakaoUser({ email, kakaoId, nickname }) {
  // 1) provider + providerId 기준 조회
  let user = await prisma.user.findFirst({
    where: {
      provider: "kakao",
      providerId: String(kakaoId),
    },
  });

  // 2) 없으면 생성
  if (!user) {
    const dummyPassword = await bcrypt.hash(`kakao_${kakaoId}_dummy`, 10);

    user = await prisma.user.create({
      data: {
        email: email,
        password: dummyPassword,
        nickname: nickname,
        provider: "kakao",
        providerId: String(kakaoId),
        role: "ROLE_USER",
      },
    });
  }

  return user;
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
 *   - code: string  (Kakao OAuth authorization code)
 * Description:
 *   - Kakao OAuth 인가 코드를 사용해 사용자 정보를 가져온 뒤
 *     내부 User를 생성/조회하고 자체 JWT를 발급한다.
 */
exports.kakaoLogin = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { code } = req.body;

    // 1) Kakao 토큰 발급 (code -> access_token)
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          // client_secret 사용 중이면 여기에 client_secret도 추가
          // client_secret: process.env.KAKAO_CLIENT_SECRET,
          code,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = tokenRes.data;

    // 2) Kakao 사용자 정보 조회
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
    const kakaoAccount = kakaoUser.kakao_account || {};
    const profile = kakaoAccount.profile || {};

    // 원본 닉네임(표시용)
    const nickname =
      profile.nickname ||
      `kakao_${kakaoId || "user"}`;

    // 🔧 내부용 이메일 생성 (닉네임 + kakaoId 기반, 항상 유니크 & NOT NULL)
    // 1) 닉네임 정규화 (한글/특수문자 제거)
    let localPart =
      nickname
        .toString()
        .normalize("NFKD")          // 유니코드 분해
        .replace(/[^\w]+/g, "")     // 영문/숫자/언더바만 남김
        .toLowerCase();

    if (!localPart) {
      localPart = `kakao${kakaoId || "user"}`;
    }

    const syntheticEmail = `${localPart}_${kakaoId || "id"}@kakao.local`;

    // 3) 유저 조회 or 생성
    //   - provider + providerId로 1차 조회
    let user = await prisma.user.findFirst({
      where: {
        provider: "kakao",
        providerId: kakaoId,
      },
    });

    //   - 없으면 새로 생성 (email은 내부용 syntheticEmail 사용)
    if (!user) {
      const dummyPassword = await bcrypt.hash(
        `kakao_${kakaoId}_dummy`,
        10
      );

      user = await prisma.user.create({
        data: {
          email: syntheticEmail,   // 🔥 실제 이메일 대신 내부용 이메일
          password: dummyPassword,
          nickname,                // 화면에 보여줄 땐 이 필드를 사용
          provider: "kakao",
          providerId: kakaoId,
          role: "ROLE_USER",
        },
      });
    }

    // 4) JWT 발급 (우리 서비스의 Access/Refresh Token)
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
