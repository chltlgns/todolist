---
description: 정보 조사를 위한 워크플로우 - 웹 검색, 코드베이스 분석, 문서 조사
---

# /research 워크플로우

특정 주제에 대한 정보를 조사하고 정리하는 프로세스입니다.

## 워크플로우 단계

### 1. 주제 분석

조사 주제와 목적을 명확히 합니다.

```
- 조사 목적 파악
- 필요한 정보 유형 식별
- 조사 범위 설정
- 우선순위 결정
```

### 2. 조사 전략 수립

효율적인 조사 방법을 결정합니다.

```
조사 유형 선택:
├── 기술 조사 → search_web, read_url_content
├── 코드베이스 조사 → find_by_name, grep_search, view_file
├── 문서 조사 → 공식 문서 URL 접근
└── 복합 조사 → 위 방법 조합
```

### 3. 정보 수집

#### 웹 검색
```
search_web으로 관련 정보 탐색
- 공식 문서
- 기술 블로그
- Stack Overflow
- GitHub 이슈/토론
```

#### 코드베이스 검색
```
- find_by_name: 파일 탐색
- grep_search: 코드 내 키워드 검색
- view_file: 파일 내용 확인
- view_file_outline: 파일 구조 파악
```

#### URL 콘텐츠 읽기
```
read_url_content로 페이지 내용 추출
- 공식 문서
- 튜토리얼
- API 레퍼런스
```

### 4. 정보 분석 및 종합

수집된 정보를 정리하고 분석합니다.

```
- 핵심 정보 추출
- 관련성 평가
- 신뢰도 검증
- 중복 제거
```

### 5. 요약 보고서 생성

조사 결과를 구조화된 형식으로 정리합니다.

```markdown
## 🔍 조사 결과: [주제]

### 개요
[주제에 대한 간단한 요약]

### 주요 발견

#### 1. [핵심 발견 1]
- 상세 내용
- 관련 코드/예시

#### 2. [핵심 발견 2]
- 상세 내용

### 관련 코드/파일
- `path/to/file` - 설명

### 권장 사항
- [제안 1]
- [제안 2]

### 참고 자료
- [문서명](URL)
- [문서명](URL)
```

## 조사 유형별 가이드

### 기술 동향 조사
```
1. search_web으로 최신 정보 검색
2. 공식 문서 확인
3. 커뮤니티 의견 수집
4. 장단점 분석
```

### 버그 해결 조사
```
1. 에러 메시지로 검색
2. Stack Overflow 확인
3. GitHub Issues 확인
4. 해결 방법 정리
```

### 라이브러리 선택 조사
```
1. 후보 라이브러리 목록
2. 각 라이브러리 문서 확인
3. 비교 분석 (기능, 성능, 활성도)
4. 권장 사항 제시
```

### 코드베이스 이해 조사
```
1. 프로젝트 구조 파악
2. 핵심 모듈 식별
3. 데이터 흐름 추적
4. 패턴 분석
```

## 예시

**명령**: `/research React Server Components 사용 방법`

**실행 결과**:
```markdown
## 🔍 조사 결과: React Server Components

### 개요
React 18+에서 도입된 새로운 컴포넌트 유형으로,
서버에서 렌더링되어 클라이언트 번들 크기를 줄임.

### 주요 발견

#### 1. 기본 개념
- 서버에서만 실행되는 컴포넌트
- 직접 DB 접근 가능
- useState, useEffect 사용 불가

#### 2. 사용 방법
```tsx
// Server Component (기본값)
async function UserList() {
  const users = await db.users.findMany();
  return <ul>...</ul>;
}
```

#### 3. Client Component 전환
```tsx
'use client';
// 클라이언트에서 실행
```

### 권장 사항
- 데이터 fetching은 Server Component에서
- 상호작용은 Client Component에서

### 참고 자료
- [React Docs](https://react.dev/reference/rsc/server-components)
- [Next.js Docs](https://nextjs.org/docs/app/building-your-application/rendering)
```
