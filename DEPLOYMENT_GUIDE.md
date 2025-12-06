물론!
지금 너가 붙여넣은 내용은 `##`, `###` 구조가 깨지고 들여쓰기/코드블록도 많이 누락되어 있어서
전체 문서를 **Markdown 구조(# 계층)로 깔끔하게 재정리**해줄게.

아래는 완성된 **DEVELOPMENT_ENVIRONMENT_SETUP_GUIDE.md** —
그대로 복사해서 저장하면 됨!

---

# 🚀 CS Fantasy Item Shop Backend

# Development Environment Setup Guide

> 개발환경 구축부터 실행까지 한 번에 해결하는 문서

본 문서는 팀원이 로컬 환경에서 **Node.js + Docker(MongoDB/Redis)** 기반의
백엔드 개발환경을 빠르고 정확하게 구축하도록 돕는 문서입니다.

MovieReviewer 프로젝트의 DEPLOYMENT_GUIDE 구조를 참고하여
**세부 단계별 설명 + 실행 흐름 + 이유 + FAQ까지 포함된 확장 문서**입니다.

---

# 📌 INDEX

1. [프로젝트 개요](#-1-프로젝트-개요)
2. [왜 개발 초기부터 Docker를 사용했는가?](#-2-왜-개발-초기부터-docker를-사용했는가)
3. [필수 설치](#-3-필수-설치)
4. [프로젝트 클론](#-4-프로젝트-클론)
5. [패키지 설치](#-5-패키지-설치)
6. [환경 변수 설정 (.env.dev)](#-6-환경-변수-설정-envdev)
7. [Docker 개발환경 실행 (MongoDB + Redis)](#-7-docker-개발환경-실행-mongodb--redis)
8. [Node 서버 로컬 실행](#-8-nodejs-서버-로컬-실행)
9. [개발 시 실행 흐름 요약](#-9-개발-시-실행-흐름-요약)
10. [npm script 사용법](#-10-npm-script-사용법)
11. [자주 발생하는 문제 해결 (FAQ)](#-11-자주-발생하는-문제-해결-faq)
12. [전체 개발 흐름 요약](#-12-전체-개발-흐름-요약)

---

# 1. 📘 프로젝트 개요

**웹서비스설계 Term Project**의 백엔드 중심 프로젝트입니다.
Node.js + Express 기반으로 개발하며 아래 구성 요소를 사용합니다.

## 기술 구성

* **Node.js** — Express 기반 REST API 서버
* **MongoDB 8.x** — 메인 데이터베이스
* **Redis 8.x** — 캐싱 & JWT Refresh Token 저장소
* **Docker** — 개발 및 배포 환경 통일
* **Docker Compose** — dev/prod 환경 분리

---

# 2. 🐳 왜 개발 초기부터 Docker를 사용했는가?

이 프로젝트는 아래 이유로 **초기부터 Docker 도입이 정답**입니다.

### ✔ MongoDB + Redis + Node.js

→ 의존성이 많음 → 로컬 설치할 경우 버전 충돌 위험 증가

### ✔ 학교 클라우드에 배포해야 함

→ 교수님이 강조: **“학교 클라우드에 직접 DB(서버) 올려라”**

### ✔ Postman 기반 정상/비정상 테스트 평가

→ 반드시 동일한 환경(컨테이너)에서 테스트해야 함

---

### 🔥 핵심 요약

> 개발 = Docker
> 배포 = Docker
> → 환경을 두 번 만들 필요가 없다!

| 이유        | 설명                     |
| --------- | ---------------------- |
| 외부 의존성 많음 | MongoDB/Redis 버전 차이 제거 |
| 배포 요구사항   | Docker 기반 배포 가능성 높음    |
| 테스트 안정성   | 팀원 간 환경 차이 제거          |
| 유지보수      | 한 줄로 환경 실행 가능          |

---

# 3. 🧩 필수 설치

## 3.1 Node.js

* 권장 버전: **v18+ 또는 v20+**
* 확인: 현재 v22.18.0

```bash
node -v
npm -v
```

---

## 3.2 Docker Desktop

* 다운로드:
  [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

* 설치 확인:

```bash
docker --version
docker compose version
```
* 윈도우 사용자라면 확인사항:
https://goddaehee.tistory.com/251#google_vignette
위 링크 참고해서 가상화기술 활성화하기
- 작업관리자에서 가상화 사용 안되어 있는 경우 BIOS 진입해서 설정해야함
- Window 10 Home 사용자라면 Hyper-v 지원하지 않으므로, "Virtual Machine Platform", "윈도우 하이퍼바이저 플랫폼"을 활성화해야함

---

# 4. 📥 프로젝트 클론

```bash
git clone <repository-url>
cd TermProject/backend
```

---

# 5. 📦 패키지 설치

```bash
npm install
```

---

# 6. ⚙️ 환경 변수 설정 (.env.dev)


## 📄 `backend/.env.dev` 생성

```env
PORT=3000

# Docker MongoDB (development)
MONGODB_URI=mongodb+srv://esther10777_db_user:x9vbh41A1RsJA4xr@cs-fantasy-shop-maindb.ly00djp.mongodb.net/?appName=cs-fantasy-shop-mainDB

# Docker Redis (development)
REDIS_URL=redis://localhost:6379

# JWT Secret for local dev
JWT_SECRET=dev_secret_change_me
```

⚠️ Git에는 커밋하지 않기
⚠️ 각 팀원이 직접 생성하기

---

# 7. 🐳 Docker 개발환경 실행코드 입력

### Mongo + Redis 도커로 켜기

```bash
docker compose -f docker-compose.dev.yml up -d
```

---

### 컨테이너 확인

```bash
docker compose -f docker-compose.dev.yml ps
```

출력 예:

```
cs-fantasy-mongo-dev   Running
cs-fantasy-redis-dev   Running
```

---

### 로그 확인

**MongoDB**

```bash
docker compose -f docker-compose.dev.yml logs -f mongo
```

**Redis**

```bash
docker compose -f docker-compose.dev.yml logs -f redis
```

---

# 8. ▶ Node.js 서버 로컬 실행

```bash
npm run dev
```

또는

```bash
node src/server.js
```

---

### 정상 확인
정상 확인하면 개발환경 설치 완료

```
GET http://localhost:3000/health
```

응답:

```json
{ "ok": true }
```

---


# 9. 🔄 개발 시 실행 흐름 요약

이 섹션은 **팀원이 매일 개발할 때 따르는 절차**를 요약한 것입니다.

---

## 도커 실행 전략
개발시: MongoDB + Redis만 도커로 올리고, Node는 로컬에서 실행
배포시: MongoDB + Redis + app(백엔드)까지 전부 도커로 실행


## ✔ 1) Docker로 Mongo + Redis 실행

```bash
cd backend
docker compose -f docker-compose.dev.yml up -d 
# npm run docker:dev:up
```

---

## ✔ 2) Node 서버 로컬 실행

```bash
npm run dev
```

또는

```bash
node src/server.js
```

---

## ✔ 3) 개발용 .env.dev 사용

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cs-fantasy-shop
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_change_me
```

---

## ✔ 4) dotenv로 로딩

```js
require('dotenv').config();
console.log(process.env.MONGODB_URI);
```

---

# 10. 📜 NPM Script 사용법

개발 편의를 위해 추천하는 스크립트:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "docker:dev:up": "docker compose -f docker-compose.dev.yml up -d",
    "docker:dev:down": "docker compose -f docker-compose.dev.yml down",
    "docker:prod:up": "docker compose -f docker-compose.prod.yml up -d --build",
    "docker:prod:down": "docker compose -f docker-compose.prod.yml down"
  }
}
```

---

### 사용 예

#### 개발 명령어
```bash
npm run docker:dev:up   # mongo+redis 실행
npm run dev             # 로컬에서 서버 실행
```

#### 배포/시연 명령어
```bash
npm run docker:prod:up  # app+mongo+redis 전부 컨테이너 실행
```

---

# 11. ❗ 자주 발생하는 문제 해결 (FAQ)

---

## ❌ no configuration file provided

**원인**: 기본 파일(`docker-compose.yml`)이 없음
**해결**:

```bash
docker compose -f docker-compose.dev.yml up -d
# npm run docker:dev:up
```

---

## ❌ MongoDB 연결 실패

확인할 것:

* Docker 실행 여부
* 27017 포트 충돌 여부
* 로그:

```bash
docker compose -f docker-compose.dev.yml logs -f mongo
```

---

## ❌ Redis 오류

로그로 확인:

```bash
docker compose -f docker-compose.dev.yml logs -f redis
```

---

# 12. 🧭 전체 개발 흐름 요약

1. Docker Desktop 실행
2. docker compose -f docker-compose.dev.yml up -d
3. `.env.dev` 작성
4. npm run dev
5. Postman으로 API 테스트

---

# 🎉 끝!