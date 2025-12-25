FROM node:18-bullseye-slim

WORKDIR /app

# 의존성 설치
COPY backend/package*.json ./
RUN npm install

# 소스 복사
COPY backend/ ./

# Prisma Client 생성
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/server.js"]
