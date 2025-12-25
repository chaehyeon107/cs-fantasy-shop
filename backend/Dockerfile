FROM node:18-alpine

WORKDIR /app

# 의존성
COPY package*.json ./
RUN npm install

# 소스 복사
COPY . .

# Prisma
RUN npx prisma generate

# 빌드
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
