FROM node:20-alpine

WORKDIR /app

# 1️⃣ 의존성 파일만 복사 (캐시 최적화)
COPY backend/package*.json ./

# 2️⃣ 프로덕션 의존성만 설치
RUN npm install --omit=dev

# 3️⃣ 소스 복사
COPY backend/ ./

# 4️⃣ Prisma Client 생성
RUN npx prisma generate

# 5️⃣ 포트
EXPOSE 3000

# 6️⃣ 실행
CMD ["node", "src/server.js"]
