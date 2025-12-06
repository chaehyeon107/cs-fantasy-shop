const jwt = require("jsonwebtoken");
const { accessTokenSecret } = require("../config/jwt");
const { prisma } = require("../config/prisma");
const { sendError } = require("../utils/errorResponse");

// ✅ JWT 인증 미들웨어
exports.authGuard = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1) Authorization 헤더 체크
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, req, "AUTH_NO_TOKEN");
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2) JWT 검증 (accessTokenSecret은 config/jwt.js에서 온 값)
    const payload = jwt.verify(token, accessTokenSecret);

    // auth.service.js에서 sub 에 user.id.toString()을 넣으므로 Number 변환
    const userId = Number(payload.sub);
    if (!userId) {
      return sendError(res, req, "AUTH_TOKEN_INVALID");
    }

    // 3) Prisma User 테이블에서 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, req, "USER_NOT_FOUND");
    }

    // 4) 컨트롤러에서 쓸 수 있도록 req.user에 최소 정보 저장
    req.user = {
      id: user.id.toString(),
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      provider: user.provider,
    };

    return next();
  } catch (err) {
    console.error("JWT verify error (auth.middleware):", err);

    if (err.name === "TokenExpiredError") {
      return sendError(res, req, "AUTH_TOKEN_EXPIRED");
    }

    // JsonWebTokenError, NotBeforeError 등 → INVALID
    return sendError(res, req, "AUTH_TOKEN_INVALID");
  }
};

// ✅ RBAC용 Role 체크 미들웨어
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, req, "AUTH_FORBIDDEN");
  }
  next();
};
