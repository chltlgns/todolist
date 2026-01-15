# Custom AI Agent System

Antigravity 환경을 위한 경량화된 멀티 에이전트 시스템입니다.

## 🎯 목적

oh-my-opencode의 오케스트레이션 패턴을 참고하여 구축된 커스텀 에이전트 시스템으로,
효율적인 개발 워크플로우와 자동 코드 검토(피드백 루프)를 제공합니다.

## 📁 프로젝트 구조

```
my-agent-system/
├── GEMINI.md                    # Antigravity 프로젝트 규칙
├── README.md                    # 프로젝트 설명 (현재 파일)
├── .agent/
│   └── workflows/               # 워크플로우 정의
│       ├── develop.md           # 개발 워크플로우
│       ├── review.md            # 코드 검토 워크플로우
│       ├── research.md          # 리서치 워크플로우
│       └── document.md          # 문서화 워크플로우
├── skills/                      # 재사용 가능한 스킬
│   ├── code-analyzer/
│   ├── web-scraper/
│   ├── api-generator/
│   └── content-creator/
├── agents/                      # 에이전트 프롬프트
│   ├── orchestrator.md
│   ├── researcher.md
│   ├── coder.md
│   ├── reviewer.md
│   └── documenter.md
└── templates/                   # 템플릿
    └── HANDOFF.md
```

## 🤖 에이전트 역할

| 에이전트 | 역할 | 주요 기능 |
|----------|------|-----------|
| **Orchestrator** | 메인 오케스트레이터 | 작업 분석, 위임, 결과 종합 |
| **Researcher** | 리서치 담당 | 웹 검색, 코드베이스 분석 |
| **Coder** | 코드 작성 | 구현, 버그 수정, 리팩토링 |
| **Reviewer** | 코드 검토 | 품질 검증, 버그 탐지 |
| **Documenter** | 문서화 | README, API 문서, 주석 |

## 🔄 워크플로우 사용법

### /develop - 개발 워크플로우
```bash
# Antigravity에서 다음 명령어 입력
/develop 새로운 사용자 인증 기능을 추가해줘
```

### /review - 코드 검토 워크플로우
```bash
# HANDOFF.md가 있는 상태에서 실행
/review
```

### /research - 리서치 워크플로우
```bash
/research React Server Components 최신 동향
```

### /document - 문서화 워크플로우
```bash
/document API 레퍼런스 문서 작성
```

## 🔁 피드백 루프 (Boris 방식)

이 시스템은 Boris의 Clear+Verify 패턴을 사용하여 코드 품질을 보장합니다:

```
┌──────────────┐
│   Develop    │  ← Coder 에이전트가 코드 작성
└──────┬───────┘
       ▼
┌──────────────┐
│   Handoff    │  ← HANDOFF.md 생성 (작업 내용/의도 기록)
└──────┬───────┘
       ▼
┌──────────────┐
│    Clear     │  ← 새 세션 시작 (컨텍스트 바이어스 제거)
└──────┬───────┘
       ▼
┌──────────────┐
│   Verify     │  ← Reviewer 에이전트가 검토
└──────────────┘
```

## ⚡ 빠른 시작

1. Antigravity에서 이 폴더를 열기
2. GEMINI.md가 자동으로 적용됨
3. 워크플로우 명령어 사용 (예: `/develop`)

## 📌 주의사항

- **API 과금 없음**: Antigravity OAuth 인증 활용
- **MCP 비사용**: 토큰 효율성을 위해 직접 통합 방식 사용
- **피드백 루프 권장**: 중요한 코드 변경 후에는 Clear+Verify 패턴 적용

## 📄 라이선스

MIT License
