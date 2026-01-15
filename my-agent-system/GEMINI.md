# Custom AI Agent System Rules

## 프로젝트 개요
이 프로젝트는 Antigravity 환경에서 동작하는 커스텀 멀티 에이전트 시스템입니다.

## 핵심 규칙

### 1. 에이전트 역할 분리
- **Orchestrator**: 작업 분석 및 위임 담당
- **Researcher**: 정보 수집 및 코드베이스 분석
- **Coder**: 코드 작성 및 수정
- **Reviewer**: 코드 검토 및 품질 검증
- **Documenter**: 문서화 작업

### 2. 워크플로우 사용법
프로젝트에서는 다음 워크플로우를 사용할 수 있습니다:
- `/develop` - 새 기능 개발
- `/review` - 코드 검토 (Boris 방식)
- `/research` - 정보 조사
- `/document` - 문서 작성

### 3. 스킬 활용
관련 작업 시 `skills/` 디렉토리의 스킬을 참조하세요:
- `code-analyzer/` - 코드 분석
- `web-scraper/` - 웹 스크래핑
- `api-generator/` - API 생성
- `content-creator/` - 콘텐츠 생성

### 4. 피드백 루프 (Boris 방식)
중요한 개발 작업 후에는 다음 패턴을 따릅니다:
1. **Develop**: 코드 작성
2. **Handoff**: `templates/HANDOFF.md` 템플릿으로 작업 기록
3. **Clear**: 새 세션 시작 (컨텍스트 바이어스 제거)
4. **Verify**: `/review` 워크플로우로 검토

### 5. 코드 품질 가이드라인
- 모든 함수에는 명확한 docstring 작성
- 에러 처리는 명시적으로
- 테스트 코드 작성 권장
- 변경 사항은 HANDOFF.md에 기록

## 금지 사항
- MCP 사용 금지 (토큰 효율성)
- 외부 API 키 사용 금지 (Antigravity OAuth 활용)
- 컨텍스트 바이어스 상태에서의 자가 검토 금지
