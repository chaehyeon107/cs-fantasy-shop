require("dotenv").config({ path: ".env.dev" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { connectRedis } = require("./config/redis");
const errorHandler = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 4000


// 2️⃣ Redis 연결
connectRedis();

// 미들웨어
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// 3️⃣ 라우트
app.use("/api", routes);

// 헬스 체크
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 전역 에러 핸들러 등록
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

