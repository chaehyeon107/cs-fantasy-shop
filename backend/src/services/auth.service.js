const jwt = require("jsonwebtoken");
const {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
} = require("../config/jwt");
const { redisClient } = require("../config/redis");
const { prisma } = require("../config/prisma");

//
// 내부 헬퍼: JWT 생성
//
function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id.toString(),
      role: user.role,
    },
    accessTokenSecret,
    { expiresIn: accessTokenExpiresIn }
  );
}

async function signRefreshToken(user) {
  const token = jwt.sign(
    {
      sub: user.id.toString(),
    },
    refreshTokenSecret,
    { expiresIn: refreshTokenExpiresIn }
  );

  const key = `refresh:${user.id}:${token}`;
  // 7일 TTL (Redis 기준 초 단위)
  await redisClient.set(key, "1", { EX: 7 * 24 * 60 * 60 });

  return token;
}

async function revokeRefreshTokenInternal(userId, refreshToken) {
  const key = `refresh:${userId}:${refreshToken}`;
  await redisClient.del(key);
}

async function isRefreshTokenValid(userId, refreshToken) {
  const key = `refresh:${userId}:${refreshToken}`;
  return !!(await redisClient.get(key));
}

/**
 * 이메일로 사용자 조회
 * 사용처:
 *   - POST /api/auth/login
 */
exports.loginUser = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

/**
 * 사용자 생성
 * 사용처:
 *   - POST /api/auth/register
 * Param:
 *   - data: { email, password(hashed), nickname, role, provider, ... }
 */
exports.createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

/**
 * 토큰 발급 (공통)
 * 사용처:
 *   - 로그인/소셜 로그인 이후 Access/Refresh 세트 발급
 * Param:
 *   - user: { id, email, nickname, role, ... }
 */
exports.issueTokensForUser = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * 토큰 재발급
 * POST /api/auth/refresh
 * Body:
 *   - refreshToken: string
 * Return:
 *   - { accessToken, refreshToken } | null
 */
exports.refreshTokens = async (oldRefreshToken) => {
  try {
    const payload = jwt.verify(oldRefreshToken, refreshTokenSecret);
    const userId = payload.sub;

    const valid = await isRefreshTokenValid(userId, oldRefreshToken);
    if (!valid) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) return null;

    // 기존 리프레시 토큰 무효화
    await revokeRefreshTokenInternal(userId, oldRefreshToken);

    // 새 토큰 세트 발급
    const accessToken = signAccessToken(user);
    const newRefreshToken = await signRefreshToken(user);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    // 만료·위조 등 모든 오류는 null로 처리 → 컨트롤러에서 에러코드 응답
    return null;
  }
};

/**
 * Refresh Token 무효화
 * 사용처:
 *   - POST /api/auth/logout
 * Param:
 *   - userId: string | number
 *   - refreshToken: string
 */
exports.revokeRefreshToken = async (userId, refreshToken) => {
  await revokeRefreshTokenInternal(userId, refreshToken);
};
