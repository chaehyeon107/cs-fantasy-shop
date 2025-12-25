FROM node:20-alpine

WORKDIR /app

# ✅ backend/ 제거 (이미 backend가 컨텍스트)
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/server.js"]
