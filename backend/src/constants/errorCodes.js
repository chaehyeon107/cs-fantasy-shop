const ERROR_CODES = {
  // 400 공통
  AUTH_INVALID_INPUT: { status: 400, message: "Invalid input" },
  VALIDATION_FAILED: { status: 400, message: "Validation failed" },

  // 400 - 필드 단위 검증 (선택사항)
  INVALID_EMAIL: { status: 400, message: "Invalid email format" },
  PASSWORD_TOO_SHORT: { status: 400, message: "Password too short" },
  NICKNAME_LENGTH_INVALID: { status: 400, message: "Nickname length invalid" },
  PASSWORD_REQUIRED: { status: 400, message: "Password is required" },
  REFRESH_TOKEN_REQUIRED: { status: 400, message: "Refresh token is required" },
  ITEM_NAME_INVALID: { status: 400, message: "Item name invalid" },
  ITEM_PRICE_MUST_BE_NUMBER: { status: 400, message: "Item price must be a number" },
  ITEM_PRICE_MUST_BE_POSITIVE: { status: 400, message: "Item price must be positive" },
  ITEM_STOCK_INVALID: { status: 400, message: "Item stock invalid" },
  ITEM_CATEGORY_INVALID: { status: 400, message: "Item category invalid" },
  ITEM_ID_INVALID: { status: 400, message: "Item id invalid" },

  // 401
  AUTH_NO_TOKEN: { status: 401, message: "Authorization header missing" },
  AUTH_INVALID_CREDENTIALS: { status: 401, message: "Invalid credentials" },
  AUTH_TOKEN_EXPIRED: { status: 401, message: "Token expired" },
  AUTH_TOKEN_INVALID: { status: 401, message: "Invalid token" },
  AUTH_REFRESH_INVALID: { status: 401, message: "Invalid refresh token" },

  // 403
  AUTH_FORBIDDEN: { status: 403, message: "Forbidden" },

  // 404
  USER_NOT_FOUND: { status: 404, message: "User not found" },
  ITEM_NOT_FOUND: { status: 404, message: "Item not found" },

  // 409
  AUTH_EMAIL_EXISTS: { status: 409, message: "Email already exists" },

  // 422 - 소셜 로그인 에러
    SOCIAL_LOGIN_FAILED: { status: 422, message: "Social login failed" },
  
  // 429
  RATE_LIMIT_EXCEEDED: { status: 429, message: "Too many requests" },

  // 500
  INTERNAL_SERVER_ERROR: { status: 500, message: "Internal server error" },
};
