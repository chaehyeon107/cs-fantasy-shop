// backend/src/middleware/error.middleware.js

const { sendError } = require("../utils/errorResponse");

/**
 * 전역 에러 처리 미들웨어
 * - 마지막에 app.use 로 등록
 */
module.exports = (err, req, res, next) => {
  // 콘솔에는 상세 로그
  console.error("❌ Unhandled Error:", err);

  // 이미 헤더가 나갔다면 Express 기본 에러 처리로 넘김
  if (res.headersSent) {
    return next(err);
  }

  // 공통 포맷으로 INTERNAL_SERVER_ERROR 응답
  return sendError(res, req, "INTERNAL_SERVER_ERROR", {
    details: {
      message: err.message,
      // 운영 환경에서는 stack 숨기고, 개발 환경에서만 노출하는 것도 가능
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
};
