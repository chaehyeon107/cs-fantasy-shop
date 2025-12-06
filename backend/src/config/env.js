const dotenv = require("dotenv");

// server.js에서도 .env.dev를 쓰고 있으니, 여기서도 통일
dotenv.config({ path: ".env.dev" });

module.exports = {
  PORT: process.env.PORT || 3000,

  // JWT 관련 (Access / Refresh 분리)
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",


  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  DATABASE_URL: process.env.DATABASE_URL || "",

  KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
  KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
};
