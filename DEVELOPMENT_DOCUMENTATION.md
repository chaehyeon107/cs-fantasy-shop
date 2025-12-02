
---

# 📄 **BACKEND_ARCHITECTURE_GUIDE.md**

*(CS Fantasy Item Shop – Backend Structure & Architecture Overview)*

```markdown
# 🏗 CS Fantasy Item Shop Backend  
# Architecture & Directory Structure Guide

본 문서는 CS Fantasy Item Shop 프로젝트의 **백엔드 구조**와  
각 디렉토리/파일의 역할을 명확하게 설명하기 위해 작성된 문서입니다.

---

# 📌 INDEX

1. 최상위 디렉토리 구조 개요  
2. Layered Architecture (MVC + Service)  
3. 각 디렉토리 상세 설명  
4. 주요 파일 역할 설명  
5. 서버 실행 흐름  
6. 기술 사용 이유 정리  

---

# 1. 📁 최상위 Directory Structure

```

backend/
├── src/
│    ├── app.js
│    ├── server.js
│    ├── config/
│    │     ├── env.js
│    │     ├── db.js
│    │     └── redis.js
│    ├── models/
│    │     ├── user.model.js
│    │     ├── item.model.js
│    │     ├── category.model.js
│    │     ├── cartItem.model.js
│    │     ├── order.model.js
│    │     └── orderItem.model.js
│    ├── services/
│    │     ├── auth.service.js
│    │     ├── item.service.js
│    │     ├── cart.service.js
│    │     ├── order.service.js
│    │     └── admin.service.js
│    ├── controllers/
│    │     ├── auth.controller.js
│    │     ├── item.controller.js
│    │     ├── cart.controller.js
│    │     ├── order.controller.js
│    │     └── admin.controller.js
│    ├── routes/
│    │     ├── index.js
│    │     ├── auth.routes.js
│    │     ├── item.routes.js
│    │     ├── cart.routes.js
│    │     ├── order.routes.js
│    │     └── admin.routes.js
│    ├── middleware/
│    │     ├── auth.middleware.js
│    │     ├── admin.middleware.js
│    │     ├── error.middleware.js
│    │     └── validate.middleware.js
│    └── utils/
│          ├── apiResponse.js
│          ├── AppError.js
│          └── logger.js
├── Dockerfile
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── package.json
├── .dockerignore
├── .env.dev  (ignored in Git)
├── .env.prod (ignored in Git)
└── README.md

```

---

# 2. 🧱 Architecture Pattern  
## ✔ MVC + Service Layer 아키텍처

이 프로젝트는 **전통 MVC를 확장한 Layered Architecture**를 사용한다.

### 📌 Model
- MongoDB + Mongoose 기반 데이터 스키마
- users, items, orders 등 DB 단일 책임 담당

### 📌 View
- Express 기반 API 프로젝트에서는 **JSON 응답**이 View 역할
- `utils/apiResponse.js`가 일관된 View 포맷 제공

### 📌 Controller
- Request/Response 처리 담당
- 파라미터 파싱 → Service 호출 → API 응답 처리

### 📌 Service (중요)
- 비즈니스 로직을 담당하는 핵심 계층
- Controller는 Service만 호출하도록 설계  
  → 유지보수 용이  
  → 테스트하기 쉬움  
  → 실무에서도 널리 쓰는 구조

---

# 3. 📂 각 디렉토리 상세 설명

## 3.1 `src/config/`
환경 설정 및 외부 서비스 연결 담당.

| 파일 | 역할 |
|------|------|
| **env.js** | `.env` 파일 읽어서 환경변수 export |
| **db.js** | MongoDB(Mongoose) 연결 설정 |
| **redis.js** | Redis 클라이언트 설정 및 연결 |

---

## 3.2 `src/models/`
테이블 1:1 매핑되는 Mongoose 모델 정의.

- user.model.js  → users 테이블
- item.model.js  → items 테이블 (스탯, rarity, cs_tag 포함)
- order.model.js  → order_items 테이블 (스냅샷 컬럼들)
- orderItem.model.js  → orders 테이블 (PACKET_SENDING / ROUTING / DONE 등 상태)
- category.model.js  → categories 테이블
- cartItem.model.js  → cart_items 테이블

---

## 3.3 `src/services/`
Controller에서 요청한 실제 비즈니스 로직을 수행.

예:
| 서비스 | 기능 |
|--------|------|
| `auth.service.js` | 회원가입, 로그인, JWT 발급 |
| `item.service.js` | 아이템 검색/필터/상세 조회 |
| `cart.service.js` | 장바구니 CRUD |
| `order.service.js` | 주문 생성/조회/상태관리 |
| `admin.service.js` | 관리자 아이템, 주문, 통계 등 |

---

## 3.4 `src/controllers/`
실제 API 엔드포인트의 요청/응답을 처리하는 계층.

Controller 역할:
1. 요청 값 파싱  
2. 입력 검증 (필요 시 validate middleware 사용)  
3. 서비스 호출  
4. JSON 응답 작성  

---

## 3.5 `src/routes/`
Controller와 URL 매핑 담당.

예:
- `auth.routes.js` → `/auth/*`
- `item.routes.js` → `/items/*`
- `cart.routes.js` → `/cart/*`
- `order.routes.js` → `/orders/*`
- `admin.routes.js` → `/admin/*`

`routes/index.js`에서 모든 라우트를 합침.

---

## 3.6 `src/middleware/`

| 미들웨어 | 설명 |
|----------|------|
| `auth.middleware.js` | JWT 인증 처리 |
| `admin.middleware.js` | 관리자 권한 체크 |
| `validate.middleware.js` | Request body 검증 |
| `error.middleware.js` | 전역 에러 핸들러 |

---

## 3.7 `src/utils/`

| 파일 | 역할 |
|--------|------|
| `apiResponse.js` | 성공/실패 응답 템플릿 |
| `AppError.js` | 커스텀 에러 클래스 |
| `logger.js` | 로깅 유틸리티 |

---

# 4. 📄 주요 파일 역할

### ✔ `server.js`
- 서버 시작부
- MongoDB + Redis 연결 후 Express 실행

### ✔ `app.js`
- 미들웨어 초기화
- 라우팅 적용
- 에러 처리 바인딩

---

# 5. 🔀 서버 실행 흐름

```

server.js
↓ (환경변수 로딩)
connectMongo()
connectRedis()
↓
app.js
↓
미들웨어 적용 (CORS, JSON 파서 등)
↓
routes/index.js
↓
개별 라우터 (auth/items/cart/orders/admin)
↓
Controller
↓
Service
↓
Model (Mongoose)
↓
MongoDB

```

---

# 6. 🧪 기술 사용 이유 정리

| 기술 | 사용 이유 |
|------|-----------|
| **Node.js + Express** | REST API 개발에 빠르고 유연 |
| **MongoDB + Mongoose** | 스키마 기반 문서저장, 아이템/카테고리 구조에 적합 |
| **Redis** | JWT Refresh Token 저장, TTL 적용에 최적 |
| **Docker** | 팀원/배포 환경 일관성 확보 |
| **Docker Compose** | dev(개발용)/prod(배포용) 환경 분리 |
| **MVC + Service 계층 구조** | 유지보수성과 확장성 향상 |
| **dotenv** | 환경변수 분리 및 보안 |

---
