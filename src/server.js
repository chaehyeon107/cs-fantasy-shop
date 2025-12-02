require("dotenv").config({ path: ".env.dev" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { connectMongo } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;

// 1️⃣ MongoDB 연결
connectMongo();

// 미들웨어
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// 2️⃣ 라우트
app.use("/api", routes);

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "backend alive" });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
