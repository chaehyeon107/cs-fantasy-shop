# Architecture

> CS Fantasy Shop Backend 아키텍처 문서  
> 범위: **레이어·모듈·배포 구조** 및 **인증 흐름 요약** (README 중복 최소화)

---

## 1. 전체 구조 요약

본 프로젝트는 **Node.js(Express) 기반 REST API 서버**를 중심으로,
**MySQL(영속 데이터)** 과 **Redis(캐시/토큰/레이트리밋)** 를 분리한 형태로 구성됩니다.

### 1-1. 기술 스택

* **Language/Framework**: Node.js, Express.js
* **ORM**: Prisma
* **DB**: MySQL 8
* **RDB**: MySQL(InnoDB) + Prisma Migration 기반 스키마 관리
* **Cache**: Redis
* **Auth**: JWT (Access/Refresh), Kakao OAuth, Firebase ID Token 검증
* **Docs**: swagger-jsdoc + swagger-ui-express (`/docs`)
* **Deploy**: Docker, docker-compose, JCloud, **PM2(지속 구동)**

---

## 2. 배포 아키텍처 (Docker + DB + Redis + PM2)

### 2-1. 논리 구성요소

| 구성요소 | 역할 |
|---|---|
| API Server | Express 앱(비즈니스 로직, 인증/인가, Swagger) |
| MySQL | 핵심 영속 데이터 저장(RDB) |
| Redis | 캐시 / Refresh Token / Rate-limit 등 |
| Process Manager | **PM2로 API 서버 지속 구동**(재시작/장애 복구) |

### 2-2. 네트워크 관점 (요청 흐름)

```text
Client
  └─ HTTP 요청 (Authorization: Bearer <accessToken>)
        ↓
API Server (Express)
  ├─ Prisma Query → MySQL
  └─ Redis read/write → 캐시/토큰/레이트리밋
```

### 2-3. 실행 관점 (운영)

운영 환경은 “데이터 계층은 컨테이너”, “애플리케이션은 프로세스 매니저” 형태로 안정성을 확보합니다.

- **DB/Redis는 docker-compose로 운영**
  - MySQL/Redis는 컨테이너로 독립 실행(재기동/로그/볼륨 관리 용이)
- **API 서버는 PM2로 운영**
  - Node 프로세스의 **크래시 자동 재시작**
  - 서버 재부팅 시 **PM2 startup**을 통해 자동 기동(지속 구동)
  - 로그를 PM2로 수집(요청 로그와 분리 운영 가능)

> 이 구조는 JCloud 환경에서 “DB/캐시 재현성(Docker)”과 “서버 프로세스 지속성(PM2)”를 함께 만족시키는 운영 패턴입니다.

---

## 3. 애플리케이션 레이어 구조

프로젝트는 `routes → controllers → services → (prisma/redis)` 흐름으로 관심사를 분리합니다.

- **Routes**: URL/Method 정의 + Swagger 주석 위치
- **Controllers**: HTTP 요청/응답 처리(입력 검증 결과 반영)
- **Services**: 비즈니스 로직, 트랜잭션 단위 정책 처리
- **Infra(Config)**: Prisma/Redis/JWT/Firebase 설정
- **Middleware**: 인증/인가/에러 공통 처리

### 3-1. 디렉터리 구조 (backend/src)

```text
backend/src
├─ server.js                      # Express 엔트리포인트
│
├─ config/                        # 인프라/공통 설정
│  ├─ db.js                       # (옵션) DB 연결/헬퍼
│  ├─ env.js                      # 환경변수 로딩/검증
│  ├─ firebase.js                 # Firebase Admin 설정
│  ├─ jwt.js                      # JWT 설정(시크릿/만료 등)
│  ├─ prisma.js                   # Prisma Client 초기화
│  └─ redis.js                    # Redis Client 초기화
│
├─ routes/                        # 라우팅 + Swagger 주석
│  ├─ index.js
│  ├─ auth.routes.js
│  ├─ admin.routes.js
│  ├─ item.routes.js
│  ├─ cart.routes.js
│  ├─ order.routes.js
│  └─ inventory.routes.js
│
├─ controllers/                   # HTTP 레이어 (req/res)
│  ├─ auth.controller.js
│  ├─ admin.controller.js
│  ├─ item.controller.js
│  ├─ cart.controller.js
│  ├─ order.controller.js
│  └─ inventory.controller.js
│
├─ services/                      # 비즈니스 로직
│  ├─ auth.service.js
│  ├─ kakao.service.js
│  ├─ admin.service.js
│  ├─ item.service.js
│  ├─ cart.service.js
│  ├─ order.service.js
│  └─ inventory.service.js
│
├─ validations/                   # 요청 유효성 검사
│  ├─ auth.validation.js
│  └─ admin.validation.js
│
├─ middleware/                    # 인증/인가/에러 등 미들웨어
│  ├─ auth.middleware.js
│  ├─ admin.middleware.js
│  └─ error.middleware.js
│
├─ utils/                         # 공통 유틸(응답/에러/쿼리)
│  ├─ apiResponse.js
│  ├─ errorResponse.js
│  └─ queryUtils.js
│
├─ swagger/                       # Swagger 설정
│  └─ swagger.js
│
└─ scripts/                       # 운영/관리 스크립트
   └─ createAdmin.js
```

### 3-2. 모듈 간 의존성(구체)

본 백엔드는 **라우트(엔드포인트) → 컨트롤러 → 서비스**의 단방향 흐름을 기본으로 하며,
요청 검증/인가/에러처리는 미들웨어로 분리되어 각 레이어의 책임을 명확히 유지합니다.

#### (1) 요청 처리 파이프라인

```text
HTTP Request
  ↓
routes/*.routes.js
  ├─ (선택) validations/*.validation.js   # express-validator로 입력 검증
  ├─ (선택) middleware/auth.middleware.js  # authGuard, requireRole (RBAC)
  └─ controllers/*.controller.js           # 요청/응답 매핑
        ↓
     services/*.service.js                 # 비즈니스 로직
        ├─ config/prisma.js  → MySQL       # 영속 데이터
        ├─ config/redis.js   → Redis       # refresh token / rate limit 등
        └─ (선택) 외부 연동
             ├─ services/kakao.service.js  # Kakao OAuth
             └─ config/firebase.js         # Firebase ID Token 검증
  ↓
HTTP Response (utils/apiResponse.js or utils/errorResponse.js)
```

#### (2) 에러 처리 흐름(전역)

```text
(Controller/Service에서 throw or next(err))
  ↓
middleware/error.middleware.js
  ↓
utils/errorResponse.js의 정의된 에러 코드로 매핑
  ↓
표준 JSON 에러 응답 반환
```

---

## 4. 인증/인가 아키텍처 요약

### 4-1. JWT 인증 (Access/Refresh)

#### 4-1-1. 구성 요소

- **auth.middleware.js**
  - `authGuard`: `Authorization: Bearer <accessToken>` 추출 → JWT 검증 → 사용자 조회(Prisma) → `req.user` 주입
  - `requireRole(...roles)`: `req.user.role` 기반 RBAC(Role) 인가
- **config/jwt.js**
  - `accessTokenSecret`, `refreshTokenSecret`, 만료시간(`expiresIn`) 등 JWT 설정/환경변수 로딩
- **services/auth.service.js**
  - `issueTokensForUser(user)`: Access/Refresh 토큰 세트 발급
  - `refreshTokens(oldRefreshToken)`: Refresh Token 검증 후 재발급(기존 토큰 무효화 포함)
  - `revokeRefreshToken(userId, refreshToken)`: 로그아웃 시 Refresh Token 무효화
- **config/redis.js**
  - `redisClient`: Refresh Token TTL 저장/조회/삭제 및 캐시/레이트리밋 기반 저장소
- **utils/errorResponse.js**
  - `sendError(res, req, code, ...)`: 표준 에러 응답 포맷으로 통일 (예: `AUTH_NO_TOKEN`, `AUTH_TOKEN_EXPIRED`)

#### 4-1-2. 처리 흐름 (Access Token)

```text
Client
  ↓  Authorization: Bearer <accessToken>
API Request
  ↓
authGuard (middleware/auth.middleware.js)
  1) Authorization 헤더 검사 (없거나 형식 불일치 → AUTH_NO_TOKEN)
  2) jwt.verify(accessToken, accessTokenSecret)
     - 만료 → AUTH_TOKEN_EXPIRED
     - 위조/오류 → AUTH_TOKEN_INVALID
  3) prisma.user.findUnique(id)로 사용자 존재 확인
     - 없음 → USER_NOT_FOUND
  4) req.user = { id, email, nickname, role, provider } 주입
  ↓
Controller/Service
  - req.user 기반으로 도메인 로직 수행
  - 필요 시 requireRole(...)로 RBAC 검사
  ↓
Response
```

#### 4-1-3. 처리 흐름 (Refresh Token 재발급)

```text
Client
  ↓  POST /api/auth/refresh (body: { refreshToken })
Controller
  ↓
auth.service.refreshTokens(oldRefreshToken)
  1) jwt.verify(refreshToken, refreshTokenSecret)
  2) Redis에서 key(refresh:<userId>:<token>) 존재 여부 확인
  3) 유효하면 기존 refresh 토큰 삭제(무효화)
  4) 새 access/refresh 토큰 발급 후 Redis에 새 refresh 토큰 TTL 저장
  ↓
Controller
  - 성공: 200 + { accessToken, refreshToken }
  - 실패(만료/위조/Redis 미존재 등): 표준 에러 응답 코드로 반환
```

> 참고(정책 포인트)  
> - 본 구현은 **Refresh Token을 Redis에 저장하고**, 재발급 시 **기존 토큰을 삭제(회전/rotation)** 하는 방식으로 “재사용 방지”를 강화합니다.
---

## 5. 데이터 계층 & 캐시 계층 설계 포인트

### 5-1. MySQL (RDB)

- Prisma 스키마 기반으로 테이블/관계를 관리
- 주문/장바구니/인벤토리 등 트랜잭션 성격이 있는 리소스를 RDB에 저장

### 5-2. Redis

- Refresh Token 저장/검증(정책에 따라 구현)
- Rate limiting(전역 적용)
- 반복 조회되는 데이터 캐시(선택)

---

## 6. 관측 가능성(로깅) & 예외 처리

- 요청 로깅: `morgan` 기반 요약 로그
- 전역 에러 처리: `error.middleware.js`에서 공통 응답 포맷으로 변환
- 코드 레벨 에러 정의/매핑: `utils/errorResponse.js`

> 민감정보(토큰/비밀번호/시크릿)는 로그에 남기지 않는 것을 원칙으로 합니다.

---
