// src/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // JSON body 파싱

// 헬스체크용 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '컴공 판타지 아이템 쇼핑몰 backend 살아있음 🧙‍♂️' });
});

// 앞으로 여기에 로그인, 상품조회, 장바구니, 결제 API 추가하면 됨!

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
