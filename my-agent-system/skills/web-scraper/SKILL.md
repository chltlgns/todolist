---
name: Web Scraper
description: 웹 페이지에서 정보를 수집하고 정리하는 스킬
---

# Web Scraper Skill

웹 페이지에서 필요한 정보를 효율적으로 수집하고 정리합니다.

## 사용 시점

- 외부 문서/API 정보 수집 시
- 기술 블로그/Stack Overflow 참조 시
- 라이브러리 문서 확인 시
- 경쟁 분석/벤치마킹 시

## 수집 방법

### 1. URL 직접 읽기 (권장)
```
read_url_content 도구 사용
- 빠르고 효율적
- JavaScript 미실행
- 정적 콘텐츠에 적합
```

### 2. 브라우저 사용 (필요시)
```
browser_subagent 도구 사용
- JavaScript 실행 필요 시
- 동적 콘텐츠
- 로그인 필요 시
```

### 3. 웹 검색
```
search_web 도구 사용
- 정보 탐색
- 관련 URL 수집
```

## 사용 방법

### Step 1: 목표 정의
```
- 수집할 정보 유형 명확화
- 신뢰할 수 있는 소스 선정
```

### Step 2: 검색 또는 URL 접근
```
search_web 또는 read_url_content 사용
```

### Step 3: 정보 추출
```
필요한 정보만 선별
코드 예시, 설명, 링크 등 구분
```

### Step 4: 결과 정리
```markdown
## 수집 결과

### 핵심 정보
- [정보 1]
- [정보 2]

### 참고 URL
- [URL 1]: 설명
- [URL 2]: 설명

### 코드 예시
[관련 코드]
```

## 출력 예시

```markdown
## 🌐 웹 스크래핑 결과: React Server Components

### 검색 쿼리
"React Server Components best practices 2024"

### 주요 발견

#### 1. 공식 문서 (react.dev)
- RSC는 서버에서만 실행
- 직접 DB 접근 가능
- bundle size 감소

#### 2. Vercel 블로그
- Next.js 14에서의 사용법
- 캐싱 전략

### 코드 예시
```tsx
// Server Component
async function UserList() {
  const users = await db.users.findMany();
  return <ul>{users.map(u => <li>{u.name}</li>)}</ul>;
}
```

### 참고 링크
- [React Docs - RSC](https://react.dev/reference/rsc)
- [Vercel Blog](https://vercel.com/blog)
```

## 주의사항

- 저작권 준수
- robots.txt 확인
- 과도한 요청 자제
- 민감 정보 수집 금지
- 출처 항상 명시
