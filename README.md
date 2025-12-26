
---

# CS Fantasy Item Shop Backend

## 1. 프로젝트 개요

본 프로젝트는 **전북대학교 「웹서비스 설계」 과목의 Term Project**로 진행한
**백엔드 실습용 사이드 프로젝트**이다.

**CS Fantasy Item Shop(컴공 판타지 아이템 쇼핑몰)**은
컴퓨터공학(Computer Science) 세계관을 **판타지 RPG 콘셉트**로 재해석한
온라인 아이템 상점 서비스이다.

이 서비스는 **개발자를 유저로 설정**하고,
개발자의 등급(Role)과 능력치(Stat)에 따라 필요한 컴공 아이템을 구매할 수 있도록 설계되었다.
예를 들어 *마법 스택*, *알고리즘 스킬북*, *메모리 갑옷*, *디버깅 포션*과 같은 아이템을 통해
컴퓨터공학 전공 요소를 게임적 메타포로 표현하였다.

개발자들 사이에서 자주 회자되는 **컴공 밈(meme)**과
전공 장비에 대한 은유적 표현을 콘텐츠로 반영하여,
단순 CRUD 쇼핑몰을 넘어 **개발자만의 재미와 몰입 요소를 담은 서비스**를 목표로 기획하였다.

본 프로젝트는 과제 1에서 설계한 **DB 스키마와 API 명세를 실제 코드로 구현**하고,
JWT 기반 인증/인가, Redis 연동, Docker 기반 컨테이너 배포(JCloud)를 통해
**실제 서비스 수준의 백엔드 아키텍처를 경험하는 것**을 주요 목표로 한다.

### 주요 기능

* 회원 인증/인가 (JWT Access / Refresh Token)
* 소셜 로그인 (Kakao OAuth, Firebase Authentication)
* Role 기반 접근 제어 (ROLE_USER / ROLE_ADMIN)
* 아이템(Item) 조회, 검색, 정렬, 페이지네이션
* 장바구니(Cart), 주문(Order), 인벤토리(Inventory) 관리
* 관리자 전용 아이템 관리 API
* 표준 에러 응답 규격 및 입력 검증
* Swagger(OpenAPI) 자동 문서화
* Postman 컬렉션 기반 API 테스트
* Docker + JCloud 기반 배포 및 Health Check 제공

---

## 2. 기술 스택

| 구분                   | 사용 기술                                              |
| -------------------- | -------------------------------------------------- |
| Language / Framework | Node.js, Express.js                                |
| ORM                  | Prisma                                             |
| Database (RDB)       | MySQL 8                                            |
| Cache                | Redis                                              |
| Auth                 | JWT (Access / Refresh), Kakao OAuth, Firebase Auth |
| API Docs             | Swagger (swagger-jsdoc, swagger-ui-express)        |
| Deploy / Infra       | Docker, Docker Compose, JCloud, PM2                |

---

## 3. 실행 방법

### 3-1. 로컬 실행 (Docker Compose)

#### ① 필수 파일 준비

```bash
cd backend
cp .env.example .env
```

* `.env` 파일에 DB 정보, JWT Secret, Redis 설정을 입력한다.
* 이때 `.env` 파일은 backend 폴더에 위치시킨다.

```bash
cd backend
touch cs-fantasy-shop-1990b-firebase-adminsdk-fbsvc-c0cb3f60e2.json
```

* `firebaseLogin.json` 파일을 준비한다.

> ⚠️ `.env` 및 `firebaseLogin.json` 파일은 GitHub Public Repository에 포함되지 않는다.

---

#### ② npm 설치

```bash
cd backend
npm install # 혹은 npm ci
```

* `npm install` 로 npm 패키지를 설치한다.


#### ③ Docker 컨테이너 실행

docker desktop 설치로 로컬 서버 생성

```bash
cd backend
docker compose -f docker-compose.dev.yml up -d --build
```

* MySQL(cs-fantasy-mysql)
* Redis(cs-fantasy-redis)
  컨테이너가 함께 기동된다.

---

#### ④ 서버 확인

| 항목           | 주소                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------ |
| API Base URL | [http://localhost:3000](http://localhost:3000)                                             |
| Swagger      | [http://localhost:3000/docs](http://localhost:3000/docs) |
| Health Check | [http://localhost:3000/health](http://localhost:3000/health)                               |

---

#### ⑤ DB 설정

Docker를 사용하지 않고 로컬에서 직접 실행할 수 있다.

```bash
cd backend
npx prisma db push
npx prisma generate

npm db seed # 시드 생성

npx prisma db push
npx prisma generate
```

* `npm db seed` 로 seed를 생성할때는 .env의 DATABASE_URL을 root 계정으로 바꿔야 한다.

---

## 4. 환경변수 설명 (`.env.example`)

| 변수명                | 설명                    |
| ------------------ | --------------------- |
| SERVER_PORT        | API 서버 포트             |
| DATABASE_URL       | MySQL 접속 URL          |
| JWT_SECRET         | JWT 서명용 Secret        |
| JWT_ACCESS_EXPIRE  | Access Token 만료 시간    |
| JWT_REFRESH_EXPIRE | Refresh Token 만료 시간   |
| REDIS_HOST         | Redis 호스트             |
| REDIS_PORT         | Redis 포트              |
| KAKAO_CLIENT_ID    | Kakao OAuth Client ID |
| FIREBASE_CONFIG    | Firebase 인증 설정        |

---

## 5. 배포 주소 (JCloud)

| 구분       | 주소                                                |
| -------- | ------------------------------------------------- |
| Base URL | `http://113.198.66.68:13210/api`                       |
| Swagger  | `http://113.198.66.68:13210/docs` |
| Health   | `http://113.198.66.68:13210/health`                |

---

## 6. 인증 플로우 설명

1. 사용자 로그인 요청 (`/auth/login`, `/auth/kakao`, `/auth/firebase`)
2. 서버에서 인증 성공 시 Access Token + Refresh Token 발급
3. 클라이언트는 Access Token을
   `Authorization: Bearer <token>` 헤더에 포함하여 API 호출
4. Access Token 만료 시
   `/auth/refresh` API를 통해 재발급
5. 토큰 위조/만료/권한 부족 시
   표준 에러 코드(`UNAUTHORIZED`, `TOKEN_EXPIRED`, `FORBIDDEN`)로 응답

---

## 7. 역할 / 권한 표 (RBAC)

| API 유형       | ROLE_USER (일반 사용자) | ROLE_ADMIN (관리자) |
| ------------ | ------------------ | ---------------- |
| 아이템 조회       | ✅                  | ✅                |
| 아이템 구매 / 주문  | ✅                  | ✅                |
| 장바구니 관리      | ✅                  | ✅                |
| 인벤토리 조회      | ✅                  | ✅                |
| 아이템 등록/수정/삭제 | ❌                  | ✅                |
| 카테고리 관리      | ❌                  | ✅                |
| 사용자 목록 조회    | ❌                  | ✅                |
| 통계/관리자 API   | ❌                  | ✅                |

---

## 8. 예제 계정 (Test Accounts)

| 구분    | 이메일                                           | 비밀번호      | 비고     |
| ----- | --------------------------------------------- | --------- | ------ |
| USER  | [user1@user.com](mailto:user1@user.com)   | 12345678  | 일반 사용자 |
| ADMIN | [admin@example.com](mailto:admin@example.com) | admin1234 | 관리자 권한 |

---

## 9. DB 연결 정보 (서버용)

| 항목       | 값                            |
| -------- | ---------------------------- |
| Host     | `localhost` |
| Port     | `3306`                       |
| Database | `shop_password`                 |
| User     | `shop_user`                     |


---

## 10. 엔드포인트 요약표

| Method | URL                   | 설명        | 권한     |
| ------ | --------------------- | --------- | ------ |
| POST   | /api/auth/login       | 로그인       | Public |
| POST   | /api/auth/refresh     | 토큰 재발급    | Public |
| GET    | /api/items            | 아이템 목록 조회 | USER   |
| GET    | /api/items/{id}       | 아이템 상세 조회 | USER   |
| POST   | /api/cart             | 장바구니 추가   | USER   |
| POST   | /api/orders           | 주문 생성     | USER   |
| GET    | /api/inventory        | 인벤토리 조회   | USER   |
| POST   | /api/admin/items      | 아이템 등록    | ADMIN  |
| PUT    | /api/admin/items/{id} | 아이템 수정    | ADMIN  |
| DELETE | /api/admin/items/{id} | 아이템 삭제    | ADMIN  |

> 전체 API는 Swagger 문서, `api-design.md`를 참고한다.

---

## 11. 보안 및 성능 고려사항

### 인증 / 보안

* **JWT 기반 인증**

  * Access / Refresh Token 구조
  * `auth` 미들웨어에서 토큰 검증 수행
* **bcrypt 기반 비밀번호 해시 처리**

  * bcrypt 적용 (`auth/service` 계층)
* **Role 기반 접근 제어**

  * 관리자 전용 API 분리 (`/admin/**`)
* **환경 변수 기반 비밀 정보 관리**

  * `.env` 파일 사용
  * JWT Secret, DB 비밀번호, Firebase Key 분리

### 요청 제어 / 안정성

* **Redis 기반 Refresh Token 관리**

  * Refresh Token 저장 및 검증
* **입력값 검증**

  * DTO 레벨에서 필드 검증
* **표준 에러 응답 포맷**

  * 공통 에러 핸들러 적용 (`error middleware`)
* **Health Check API 제공**

  * `/health` 엔드포인트 제공 (무인증, 200 OK)

### 성능 관련

* **페이지네이션 기반 목록 조회**

  * 목록 API 전반에 적용
* **검색/정렬 대상 컬럼 인덱스 적용**

  * Prisma schema에 명시적 인덱스 정의
* **불필요한 데이터 조회 방지**

  * 필요한 필드만 select 하도록 쿼리 구성


---

## 12. 한계 및 개선 계획

* 주문 취소/환불 정책의 단순성
* 관리자 통계 API 확장 필요
* 프론트엔드 부재로 사용자 경험 제한
* 캐시 전략 고도화 필요

---

## 13. 참고 문서

* `docs/architecture.md`
* `docs/db-schema.md`
* `docs/api-design.md`
* Swagger API 문서
* Postman Collection

---
