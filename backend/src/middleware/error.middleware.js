// backend/src/middleware/error.middleware.js

const { sendError, ERROR_DEFINITIONS } = require("../utils/errorResponse");

/**
 * 전역 에러 처리 미들웨어
 * - 마지막에 app.use 로 등록
 */
module.exports = (err, req, res, next) => {
  // 콘솔에는 상세 로그
  console.error("❌ Unhandled Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  // 1) err.code가 우리가 정의한 ERROR_DEFINITIONS에 있으면 그대로 매핑
  if (err.code && ERROR_DEFINITIONS[err.code]) {
    return sendError(res, req, err.code, {
      details: err.details,
    });
  }

  // 2) 그 외는 INTERNAL_SERVER_ERROR로 처리
  return sendError(res, req, "INTERNAL_SERVER_ERROR", {
    details: {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
};
