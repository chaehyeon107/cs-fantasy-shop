require("dotenv").config({ path: ".env.dev" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { connectRedis } = require("./config/redis");
const errorHandler = require("./middleware/error.middleware");
const apiResponse = require("./utils/apiResponse");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 4000;

// ✅ Rate Limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Redis 연결
connectRedis();

// ✅ 공통 미들웨어
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ✅ API 라우트 (여기서 auth 포함 전부 처리)
app.use("/api", apiLimiter, routes);

// ✅ 헬스 체크
app.get("/health", (req, res) => {
  return apiResponse.success(
    res,
    {
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
    200
  );
});

// ✅ ✅ ✅ Kakao OAuth code 콜백 (Redirect URI 전용)
app.get("/auth/kakao/callback", (req, res) => {
  const code = req.query.code;

  return res.send(`
    <html>
      <body>
        <h3>Kakao 로그인 인가 코드</h3>
        <p>아래 code 값을 Postman에서 <code>POST /api/auth/kakao</code> 요청 Body에 넣어 사용하세요.</p>
        <pre style="padding: 8px; background: #f4f4f4; border: 1px solid #ccc;">
code = ${code || "(code 없음)"}
        </pre>
      </body>
    </html>
  `);
});

// ✅ 전역 에러 핸들러 (항상 맨 마지막!)
app.use(errorHandler);

// ✅ 서버는 단 한 번만 실행
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
