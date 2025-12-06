// backend/src/utils/errorResponse.js

// 대표 에러 코드 정의
const ERROR_DEFINITIONS = {
  VALIDATION_FAILED: {
    status: 400,
    message: "요청 필드 검증에 실패했습니다.",
  },
  AUTH_EMAIL_EXISTS: {
    status: 409,
    message: "이미 사용 중인 이메일입니다.",
  },
  AUTH_INVALID_CREDENTIALS: {
    status: 401,
    message: "이메일 또는 비밀번호가 올바르지 않습니다.",
  },
  AUTH_REFRESH_INVALID: {
    status: 401,
    message: "유효하지 않은 리프레시 토큰입니다.",
  },
  AUTH_INVALID_INPUT: {
    status: 400,
    message: "잘못된 인증 요청입니다.",
  },
  UNAUTHORIZED: {
    status: 401,
    message: "인증이 필요합니다.",
  },
  FORBIDDEN: {
    status: 403,
    message: "이 리소스에 접근할 권한이 없습니다.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "사용자를 찾을 수 없습니다.",
  },
  ITEM_NOT_FOUND: {
    status: 404,
    message: "아이템을 찾을 수 없습니다.",
  },
  SOCIAL_LOGIN_FAILED: {
    status: 400,
    message: "소셜 로그인에 실패했습니다.",
  },
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: "요청 한도를 초과했습니다.",
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: "서버 내부 오류가 발생했습니다.",
  },
};

/**
 * 공통 에러 응답 헬퍼
 * 사용처:
 *   - 컨트롤러에서 비즈니스 에러 응답 시
 *   - 전역 에러 미들웨어에서 fallback 용
 *
 * @param {Response} res
 * @param {Request} req
 * @param {string} code - 위 ERROR_DEFINITIONS의 key
 * @param {object} extra - { details: {...}, overrideMessage?: string }
 */
function sendError(res, req, code = "INTERNAL_SERVER_ERROR", extra = {}) {
  const def = ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS.INTERNAL_SERVER_ERROR;

  const status = def.status || 500;
  const message = extra.overrideMessage || def.message;

  const payload = {
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
    status,
    code,
    message,
  };

  if (extra.details) {
    payload.details = extra.details;
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendError,
  ERROR_DEFINITIONS,
};
