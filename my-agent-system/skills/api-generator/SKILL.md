---
name: API Generator
description: RESTful API 또는 GraphQL API를 설계하고 생성하는 스킬
---

# API Generator Skill

API 엔드포인트를 설계하고 구현 코드를 생성합니다.

## 사용 시점

- 새 API 엔드포인트 생성 시
- API 리팩토링 시
- CRUD 작업 자동화 시
- API 문서 생성 시

## 지원 스택

| 스택 | 프레임워크 |
|------|-----------|
| **Node.js** | Express, Fastify, Next.js API Routes |
| **Python** | FastAPI, Flask, Django REST |
| **기타** | 요청에 따라 확장 |

## API 설계 원칙

### RESTful 원칙
```
GET    /resources      - 목록 조회
GET    /resources/:id  - 단일 조회
POST   /resources      - 생성
PUT    /resources/:id  - 전체 수정
PATCH  /resources/:id  - 부분 수정
DELETE /resources/:id  - 삭제
```

### 응답 형식
```json
{
  "success": true,
  "data": { ... },
  "message": "OK",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 에러 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  }
}
```

## 사용 방법

### Step 1: 요구사항 정의
```
- 리소스 정의 (User, Product, Order 등)
- 필요한 작업 (CRUD, 검색, 집계 등)
- 인증/권한 요구사항
```

### Step 2: 스키마 설계
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

### Step 3: 엔드포인트 구현
```typescript
// Next.js API Route 예시
export async function GET(req: Request) {
  const users = await db.user.findMany();
  return Response.json({ success: true, data: users });
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await db.user.create({ data: body });
  return Response.json({ success: true, data: user });
}
```

### Step 4: 문서화
```markdown
## POST /api/users

사용자를 생성합니다.

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | ✅ | 이메일 주소 |
| name | string | ✅ | 사용자 이름 |

**Response**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 생성된 사용자 ID |
```

## 출력 예시

```
## 🔧 API 생성 결과

### 생성된 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/users | 사용자 목록 |
| GET | /api/users/:id | 사용자 조회 |
| POST | /api/users | 사용자 생성 |
| PUT | /api/users/:id | 사용자 수정 |
| DELETE | /api/users/:id | 사용자 삭제 |

### 생성된 파일
- `src/app/api/users/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/types/user.ts`
```

## 검증 항목

- [ ] 입력값 검증
- [ ] 에러 처리
- [ ] 인증/권한 체크
- [ ] 페이지네이션
- [ ] 응답 형식 일관성
