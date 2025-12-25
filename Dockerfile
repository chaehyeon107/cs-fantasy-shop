FROM node:18-alpine

# 앱 실행 디렉토리
WORKDIR /app

# -------------------------
# 1️⃣ 의존성 설치
# -------------------------
# backend/package.json만 먼저 복사 (캐시 최적화)
COPY backend/package*.json ./
RUN npm install

# -------------------------
# 2️⃣ 소스 코드 복사
# -------------------------
COPY backend/ .

# -------------------------
# 3️⃣ Prisma
# -------------------------
RUN npx prisma generate

# -------------------------
# 4️⃣ 빌드
# -------------------------
RUN npm run build

# -------------------------
# 5️⃣ 실행
# -------------------------
EXPOSE 3000
CMD ["npm", "run", "start"]
