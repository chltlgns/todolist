---
name: Code Analyzer
description: 코드베이스 구조 분석, 패턴 파악, 의존성 분석을 수행하는 스킬
---

# Code Analyzer Skill

코드베이스를 체계적으로 분석하여 구조, 패턴, 의존성 정보를 제공합니다.

## 사용 시점

- 새 프로젝트 분석 시
- 기존 코드 이해 필요 시
- 리팩토링 전 현황 파악 시
- 의존성 문제 해결 시

## 분석 항목

### 1. 구조 분석
```
프로젝트/
 ├── 디렉토리 구조 파악
 ├── 파일 분류 (소스, 설정, 테스트)
 └── 엔트리포인트 식별
```

### 2. 패턴 분석
- 아키텍처 패턴 (MVC, MVVM, Clean Architecture 등)
- 디자인 패턴 (Factory, Singleton, Observer 등)
- 코드 스타일 (네이밍 컨벤션, 구조)

### 3. 의존성 분석
- 패키지 의존성 (package.json, requirements.txt)
- 내부 모듈 의존성
- 외부 API 연동

## 사용 방법

### Step 1: 프로젝트 구조 탐색
```
find_by_name으로 주요 파일 탐색
list_dir로 디렉토리 구조 파악
```

### Step 2: 핵심 파일 분석
```
view_file_outline으로 파일 개요 확인
view_code_item으로 주요 함수/클래스 분석
```

### Step 3: 의존성 확인
```
package.json / requirements.txt 확인
import 문 분석으로 내부 의존성 파악
```

### Step 4: 결과 정리
```markdown
## 분석 결과

### 프로젝트 구조
- 아키텍처: [패턴명]
- 주요 디렉토리: [목록]

### 핵심 모듈
- [모듈명]: [역할]

### 의존성
- 주요 패키지: [목록]
- 내부 의존 관계: [설명]

### 개선 제안
- [제안사항]
```

## 출력 예시

```markdown
## 🔍 코드베이스 분석 결과

### 프로젝트 개요
- **언어**: TypeScript
- **프레임워크**: Next.js 14
- **아키텍처**: App Router + Server Components

### 디렉토리 구조
src/
├── app/           # 페이지 라우트
├── components/    # UI 컴포넌트
├── lib/           # 유틸리티
├── hooks/         # 커스텀 훅
└── types/         # 타입 정의

### 핵심 파일
- `src/app/layout.tsx` - 루트 레이아웃
- `src/lib/db.ts` - 데이터베이스 연결
- `src/components/ui/` - 공통 UI 컴포넌트

### 의존성 분석
- next: ^14.0.0
- react: ^18.2.0
- prisma: ^5.0.0

### 특이사항
- Prisma ORM 사용
- 인증: NextAuth.js
```

## 주의사항

- 대규모 프로젝트는 핵심 부분 우선 분석
- 시간 제약 시 목적에 맞는 부분만 집중
- 분석 결과는 객관적으로 기술
