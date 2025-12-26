# API Design
> **기준:** 제출된 Postman Collection(`CS Fantasy Item Shop API final.postman_collection.json`)에 포함된 요청을 기준으로 정리한 API 문서입니다.
## 1. Base URL
- `{{baseUrl}}` 기본값: `http://113.198.66.68:13180/api`
- 모든 엔드포인트는 `{{baseUrl}}` 하위에서 동작하며, `{{baseUrl}}` 값에는 이미 `/api`가 포함되어 있습니다.

## 2. 인증 방식
- 보호된 API는 `Authorization: Bearer {{accessToken}}` 헤더를 사용합니다.
- 토큰 재발급은 `POST /auth/refresh`(Refresh Token 사용)로 수행합니다.
- 관리자 API(`/admin/**`)는 `ROLE_ADMIN` 권한이 필요합니다.

## 3. 엔드포인트 요약
### Auth
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| POST | `/api/auth/register` | 불필요 | - |  |
| POST | `/auth/firebase` | 불필요 | - | Firebase ID Token으로 로그인/회원생성 |
| POST | `/auth/kakao` | 불필요 | - | Kakao OAuth code로 로그인/회원생성 |
| POST | `/auth/login` | 불필요 | - | 로그인(Access/Refresh 발급) |
| POST | `/auth/logout` | 불필요 | - | 로그아웃(Refresh 무효화) |
| GET | `/auth/me` | 불필요 | - | 내 프로필 조회 |
| POST | `/auth/refresh` | 불필요 | - | Refresh Token으로 재발급 |
| POST | `/auth/register` | 불필요 | - | 로컬 회원가입(이메일/비밀번호) |

### Items
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| GET | `/api/items/999999` | 불필요 | - |  |
| GET | `/api/items/abc` | 불필요 | - |  |
| GET | `/items/{{itemId}}` | 불필요 | - | 아이템 상세 조회 |
| GET | `/items?csTag=operating-system&page=0&size=10&sort=createdAt,DESC` | 불필요 | - |  |
| GET | `/items?page=-1&size=999` | 불필요 | - |  |
| GET | `/items?page=0&size=10&sort=createdAt,DESC` | 불필요 | - |  |
| GET | `/items?sort=price,ASC&page=0&size=10` | 불필요 | - |  |

### Cart
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| DELETE | `/cart` | 불필요 | - |  |
| GET | `/cart` | 불필요 | - | 장바구니 조회 |
| PATCH | `/cart` | 불필요 | - | 장바구니 수량 변경 |
| POST | `/cart` | 불필요 | - | 장바구니 담기 |

### Orders (Inventory)
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| GET | `/orders` | 불필요 | - | 내 주문 목록/상세 |
| POST | `/orders` | 불필요 | - | 주문 생성(장바구니 기반) |
| GET | `/orders/1` | 불필요 | - | 내 주문 목록/상세 |

### Admin - Items
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| POST | `/admin/items` | 불필요 | ROLE_ADMIN | (관리자) 아이템 생성 |
| PATCH | `/admin/items/9999999` | 불필요 | ROLE_ADMIN | (관리자) 아이템 수정 |
| DELETE | `/admin/items/:itemId` | 불필요 | ROLE_ADMIN | (관리자) 아이템 삭제(비활성화/삭제) |
| PATCH | `/admin/items/:itemId` | 불필요 | ROLE_ADMIN | (관리자) 아이템 수정 |
| PATCH | `/admin/items/abc` | 필요 | ROLE_ADMIN | (관리자) 아이템 수정 |

### Admin - Orders
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| GET | `/admin/orders?status=PACKET_SENDING` | 불필요 | ROLE_ADMIN | (관리자) 주문 목록 조회 |

### Admin - Stats
| Method | Path | Auth | Role | 설명 |
|---|---|---|---|---|
| GET | `/admin/stats/orders-summary?from=2025-01-01&to=2025-12-31` | 불필요 | ROLE_ADMIN | (관리자) 통계 조회 |
| GET | `/admin/stats/popular-items?limit=10` | 불필요 | ROLE_ADMIN | (관리자) 통계 조회 |
| GET | `/admin/stats/top-users?limit=10` | 불필요 | ROLE_ADMIN | (관리자) 통계 조회 |

## 4. 요청 파라미터/바디 예시
Postman에 포함된 대표 요청 바디/쿼리 예시를 발췌했습니다.
### POST /auth/register
- Body 예시:
**Register**

```json
{
  "email": "user2@user.com",
  "password": "12345678",
  "nickname": "유저"
}
```

### POST /auth/login
- Body 예시:
**Login**

```json
{
  "email": "admin@example.com", // "user2@user.com",
  "password": "admin1234" // "12345678"
}
```
**Admin Login**

```json
{
  "email": "admin@example.com",
  "password": "admin1234"
}
```

### POST /auth/kakao
- Body 예시:
**Kakao Login**

```json
{
  "code": "Q7ftH6Oke1FRar10_T-6McgTC1aE58L6hj7Yhp1wltMtf9gICzfLdQAAAAQKFxAvAAABmzHnXiWSBpCp5rpDbg"
}
```

### POST /auth/firebase
- Body 예시:
**Firebase Login**

```json
{
  "idToken": "{{firebaseIdToken}}"
}
```

### POST /cart
- Body 예시:
**Add to Cart**

```json
{
  "itemId": 352,
  "quantity": 2
}
```

### POST /orders
- Body 예시:
**Create Order**

```json
{
  "paymentMethod": "CARD",
  "shippingAddress": "서울시 어딘가",
  "shippingMemo": "조심히 배송해주세요"
}
```

### POST /admin/items
- Body 예시:
**Create Item - 정상 요청 (201)**

```json
{
  "name": "A+ 맞는 법",
  "price": 3000,
  "description": "A+ 맞는 족보",
  "rarity": "EPIC",
  "stat_int": 10,
  "stat_str": 0,
  "stat_dex": 0,
  "stat_lck": 3,
  "cs_tag": "족보",
  "stock_quantity": 99,
  "is_active": true
}
```
**Create Item - 이름 비어있음 (400 ITEM_NAME_INVALID)**

```json
{
  "name": "",
  "price": 1000
}
```

## 5. Postman 컬렉션 구성 메모

- `POST /auth/login`은 일반 사용자/관리자 모두 사용하며, 같은 엔드포인트를 일반 사용자/관리자 계정으로 호출하는 방식입니다.

- `POST /auth/register`은 일반 사용자 계정을 이메일로 생성할 때 사용합니다.

- Admin - Items, Orders, Stats는 관리자 계정으로 로그인해야 사용할 수 있습니다.


## 6. swagger 문서

api에 대한 요청 파라미터/바디/응답 규격은 아래 swagger 문서 참고 바랍니다.
`http://113.198.66.68:13210/docs/`