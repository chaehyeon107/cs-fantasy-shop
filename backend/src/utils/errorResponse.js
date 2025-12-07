// backend/src/utils/errorResponse.js

/**
 * 공통 에러 코드 정의
 * - HTTP status + message
 * - sendError(res, req, "ERROR_CODE") 형태로 사용
 * - express-validator와 연계되는 필드 단위 코드도 포함
 */
const ERROR_DEFINITIONS = {
  // -------------------------------
  // 400 - 공통 / 형식 오류
  // -------------------------------
  BAD_REQUEST: {
    status: 400,
    message: "요청 형식이 올바르지 않습니다.",
  },
  VALIDATION_FAILED: {
    status: 400,
    message: "요청 필드 검증에 실패했습니다.",
  },
  AUTH_INVALID_INPUT: {
    status: 400,
    message: "잘못된 인증 요청입니다.",
  },
  INVALID_QUERY_PARAM: {
    status: 400,
    message: "쿼리 파라미터 값이 올바르지 않습니다.",
  },

  // -------------------------------
  // 400 - 필드 단위 검증 (express-validator .withMessage 에서도 사용)
  // -------------------------------
  INVALID_EMAIL: {
    status: 400,
    message: "이메일 형식이 올바르지 않습니다.",
  },
  PASSWORD_TOO_SHORT: {
    status: 400,
    message: "비밀번호는 최소 6자 이상이어야 합니다.",
  },
  NICKNAME_LENGTH_INVALID: {
    status: 400,
    message: "닉네임은 1~20자 이내여야 합니다.",
  },
  PASSWORD_REQUIRED: {
    status: 400,
    message: "비밀번호는 필수 입력 값입니다.",
  },
  REFRESH_TOKEN_REQUIRED: {
    status: 400,
    message: "refreshToken은 필수 입력 값입니다.",
  },
  ITEM_NAME_INVALID: {
    status: 400,
    message: "아이템 이름이 올바르지 않습니다.",
  },
  ITEM_PRICE_MUST_BE_NUMBER: {
    status: 400,
    message: "아이템 가격은 숫자여야 합니다.",
  },
  ITEM_PRICE_MUST_BE_POSITIVE: {
    status: 400,
    message: "아이템 가격은 0 이상이어야 합니다.",
  },
  ITEM_STOCK_INVALID: {
    status: 400,
    message: "아이템 재고 값이 올바르지 않습니다.",
  },
  ITEM_CATEGORY_INVALID: {
    status: 400,
    message: "아이템 카테고리 값이 올바르지 않습니다.",
  },
  ITEM_ID_INVALID: {
    status: 400,
    message: "아이템 ID 값이 올바르지 않습니다.",
  },
    ITEM_DESCRIPTION_INVALID: {
    status: 400,
    message: "아이템 설명 값이 올바르지 않습니다.",
  },
  ITEM_RARITY_INVALID: {
    status: 400,
    message: "아이템 희귀도 값이 올바르지 않습니다.",
  },
  ITEM_STAT_INVALID: {
    status: 400,
    message: "아이템 스탯 값이 올바르지 않습니다.",
  },
  ITEM_IS_ACTIVE_INVALID: {
    status: 400,
    message: "아이템 활성화 여부 값이 올바르지 않습니다.",
  },

  // 🔹 소셜 로그인 validation
  KAKAO_CODE_REQUIRED: {
    status: 400,
    message: "Kakao authorization code는 필수입니다.",
  },
  FIREBASE_ID_TOKEN_REQUIRED: {
    status: 400,
    message: "Firebase ID Token은 필수입니다.",
  },

  // -------------------------------
  // 401 - 인증 문제
  // -------------------------------
  AUTH_NO_TOKEN: {
    status: 401,
    message: "Authorization 헤더가 필요합니다.",
  },
  AUTH_INVALID_CREDENTIALS: {
    status: 401,
    message: "이메일 또는 비밀번호가 올바르지 않습니다.",
  },
  AUTH_TOKEN_EXPIRED: {
    status: 401,
    message: "엑세스 토큰이 만료되었습니다.",
  },
  AUTH_TOKEN_INVALID: {
    status: 401,
    message: "유효하지 않은 토큰입니다.",
  },
  AUTH_REFRESH_INVALID: {
    status: 401,
    message: "유효하지 않은 리프레시 토큰입니다.",
  },

  // 별칭(legacy 코드 호환용)
  UNAUTHORIZED: {
    status: 401,
    message: "인증이 필요합니다.",
  },

  // -------------------------------
  // 403 - 권한 문제
  // -------------------------------
  AUTH_FORBIDDEN: {
    status: 403,
    message: "이 리소스에 접근할 권한이 없습니다.",
  },
  FORBIDDEN: {
    status: 403,
    message: "이 리소스에 접근할 권한이 없습니다.",
  },

  // -------------------------------
  // 404 - Not Found
  // -------------------------------
  RESOURCE_NOT_FOUND: {
    status: 404,
    message: "요청한 리소스를 찾을 수 없습니다.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "사용자를 찾을 수 없습니다.",
  },
  ITEM_NOT_FOUND: {
    status: 404,
    message: "아이템을 찾을 수 없습니다.",
  },

  // -------------------------------
  // 409 - Conflict
  // -------------------------------
  AUTH_EMAIL_EXISTS: {
    status: 409,
    message: "이미 사용 중인 이메일입니다.",
  },
  DUPLICATE_RESOURCE: {
    status: 409,
    message: "중복된 리소스가 존재합니다.",
  },
  STATE_CONFLICT: {
    status: 409,
    message: "리소스 상태가 요청과 충돌합니다.",
  },

  // -------------------------------
  // 422 - Unprocessable Entity
  // -------------------------------
  UNPROCESSABLE_ENTITY: {
    status: 422,
    message: "요청 내용을 처리할 수 없습니다.",
  },
  SOCIAL_LOGIN_FAILED: {
    status: 422,
    message: "소셜 로그인에 실패했습니다.",
  },

  // -------------------------------
  // 429 - Rate Limit
  // -------------------------------
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: "요청 한도를 초과했습니다.",
  },
  TOO_MANY_REQUESTS: {
    status: 429,
    message: "요청 한도를 초과했습니다.",
  },

  // -------------------------------
  // 500 - Server Error
  // -------------------------------
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: "서버 내부 오류가 발생했습니다.",
  },
  DATABASE_ERROR: {
    status: 500,
    message: "데이터베이스 처리 중 오류가 발생했습니다.",
  },
  UNKNOWN_ERROR: {
    status: 500,
    message: "알 수 없는 오류가 발생했습니다.",
  },
};

/**
 * 공통 에러 응답 헬퍼
 *
 * @param {Response} res
 * @param {Request} req
 * @param {string} code - 위 ERROR_DEFINITIONS의 key
 * @param {object} extra - { details?: object, overrideMessage?: string }
 */
function sendError(res, req, code = "INTERNAL_SERVER_ERROR", extra = {}) {
  const def =
    ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS.INTERNAL_SERVER_ERROR;

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
