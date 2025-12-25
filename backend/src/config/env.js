const dotenv = require("dotenv");

dotenv.config({ path: process.env.ENV_FILE || ".env" });

module.exports = {
  // 서버 포트 (PORT는 예외적으로 fallback 허용)
  PORT: process.env.PORT || 3000,

  // JWT (없으면 바로 에러 나게 하는 게 맞음)
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  // Redis / DB (fallback ❌)
  REDIS_URL: process.env.REDIS_URL,
  DATABASE_URL: process.env.DATABASE_URL,

  // OAuth
  KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
  KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
};
