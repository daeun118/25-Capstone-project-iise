# BookBeats 문서

**프로젝트**: Reading Experience Platform (독서 여정 플랫폼)
**최종 업데이트**: 2025-10-22
**상태**: Phase 11 완료 (UI/UX 개선)

---

## 📚 문서 구조

```
docs/
├── README.md (이 파일)
├── architecture/       # 아키텍처 및 디자인
├── implementation/     # 구현 완료 기록
├── integration/        # 외부 서비스 통합
└── migration/          # 마이그레이션 가이드
```

---

## 🏗️ Architecture (아키텍처)

### [design-system.md](./architecture/design-system.md)
BookBeats 디자인 시스템 전체 명세

**포함 내용**:
- 디자인 철학 및 핵심 가치
- 색상 시스템 (라이트 모드)
- 타이포그래피 (Pretendard Variable)
- Spacing & Layout 시스템
- 컴포넌트 패턴 (Card, Button, Badge 등)
- 감정 태그 색상 팔레트
- 반응형 디자인 가이드라인

**참고 대상**: 디자이너, 프론트엔드 개발자

---

### [performance.md](./architecture/performance.md)
성능 최적화 가이드

**포함 내용**:
- 이미지 최적화 (Next.js Image)
- 코드 스플리팅
- 번들 크기 최적화
- 렌더링 성능 개선
- Lighthouse 점수 개선 전략

**참고 대상**: 프론트엔드 개발자

---

### [refactoring-plan.md](./architecture/refactoring-plan.md)
기술 부채 및 리팩토링 계획

**포함 내용**:
- any 타입 제거 계획
- 컴포넌트 재사용성 개선
- 에러 처리 통일
- 코드 품질 개선 로드맵

**참고 대상**: 모든 개발자

---

## 🚀 Implementation (구현 기록)

### [phase-11-ui-ux.md](./implementation/phase-11-ui-ux.md)
Phase 11: UI/UX 개선 완료 보고서

**완료 항목**:
- ❌ 다크 모드 구현 (제거됨)
- ✅ 반응형 디자인 최적화
- ✅ 접근성 개선 (ARIA 레이블, 키보드 네비게이션)
- ✅ 로딩/에러 UI 통일
- ✅ 애니메이션 개선 (Framer Motion)

**참고 대상**: UI/UX 개선 히스토리 확인

---

## 🔌 Integration (외부 통합)

### [mureka-integration.md](./integration/mureka-integration.md)
Mureka AI 음악 생성 통합 가이드

**포함 내용**:
- ✅ 구현 완료 사항 (아키텍처, 컴포넌트)
- 🔧 사용자 설정 가이드 (단계별)
  - Mureka 계정 설정
  - UV 패키지 매니저 설치
  - .mcp.json 설정
  - 환경 변수 설정
  - Supabase Storage 설정
- 🧪 테스트 방법 (수동/스크립트)
- 💰 비용 추정
- ❗ 문제 해결 (트러블슈팅)

**참고 대상**:
- **개발자**: 음악 생성 로직 이해
- **시스템 관리자**: Mureka 설정 및 배포
- **사용자**: 실제 음악 생성 활성화

---

## 🔄 Migration (마이그레이션)

### [tailwind-v4-migration.md](./migration/tailwind-v4-migration.md)
Tailwind CSS v4 & Database 마이그레이션 가이드

**포함 내용**:

**1. Database Migration**
- music_tracks 필드 확장 (description, genre, mood)
- SQL 실행 방법 (Supabase Dashboard/CLI)
- 스키마 검증 방법

**2. Tailwind CSS v4 마이그레이션**
- v3 → v4 업그레이드 단계
- PostCSS 설정 변경
- @theme 지시어 사용법
- CSS 변수 기반 색상 시스템

**참고 대상**:
- **백엔드 개발자**: DB 마이그레이션
- **프론트엔드 개발자**: Tailwind v4 마이그레이션

---

## 📖 루트 문서 (Root Documents)

프로젝트 루트에도 중요한 문서들이 있습니다:

### [CLAUDE.md](../CLAUDE.md)
Claude Code를 위한 프로젝트 가이드

**포함 내용**:
- 주요 명령어 (dev, build, test)
- 기술 스택 요약
- 프로젝트 구조 개요
- ⭐ 3단계 음악 생성 로직 (`src/lib/openai/client.ts`)
- Next.js 15 주요 변경사항 (params await)
- Supabase 클라이언트 분리 패턴
- MCP 도구 사용법
- 알려진 이슈 및 해결법
- 중요 원칙 (금지/필수 사항)

**참고 대상**: Claude Code, 신규 개발자

---

### [PRD_instruction.md](../PRD_instruction.md)
제품 요구사항 문서 (Product Requirements Document)

**포함 내용**:
- 서비스 핵심 컨셉
- 타겟 사용자 (페르소나)
- MVP 핵심 기능 (P0)
- 중요 기능 (P1)
- 제외 기능 (Phase 2 이후)
- 기술 스택 상세
- AI 생성 플로우 (v0, vN, vFinal)
- 비기능 요구사항 (성능, 보안, 확장성)
- 핵심 사용자 시나리오

**참고 대상**: 프로덕트 기획, 전체 팀

---

### [execution_plan.md](../execution_plan.md)
개발 실행 계획

**포함 내용**:
- Phase 0-10: ✅ 완료 (요약)
- Phase 11: 🔄 진행 중 (UI/UX 개선)
- Phase 12-13: ⏳ 대기 (배포, 앨범커버)
- 미완료 기능 (Mureka MCP 실제 음악 생성)
- 기술 부채 (타입 안전성, 에러 처리, 성능 최적화)

**참고 대상**: 프로젝트 관리, 개발 진행 상황 확인

---

## 🔍 빠른 참조 (Quick Reference)

### 새로운 기능 개발 시
1. [PRD_instruction.md](../PRD_instruction.md) - 기능 요구사항 확인
2. [design-system.md](./architecture/design-system.md) - 디자인 가이드라인
3. [CLAUDE.md](../CLAUDE.md) - 코딩 규칙 및 패턴

### 배포 준비 시
1. [execution_plan.md](../execution_plan.md) - 완료/미완료 체크
2. [mureka-integration.md](./integration/mureka-integration.md) - Mureka 설정
3. [tailwind-v4-migration.md](./migration/tailwind-v4-migration.md) - DB 마이그레이션

### 문제 해결 시
1. [CLAUDE.md](../CLAUDE.md) - 알려진 이슈 섹션
2. [mureka-integration.md](./integration/mureka-integration.md) - 트러블슈팅
3. [refactoring-plan.md](./architecture/refactoring-plan.md) - 기술 부채 확인

---

## 📝 문서 업데이트 가이드

### 문서 업데이트 시기

- **새 기능 완료 시**: implementation/ 폴더에 완료 보고서 추가
- **외부 통합 추가 시**: integration/ 폴더에 가이드 추가
- **DB/코드 마이그레이션 시**: migration/ 폴더에 가이드 추가
- **아키텍처 변경 시**: architecture/ 문서 업데이트

### 문서 작성 원칙

1. **날짜 명시**: 최종 업데이트 날짜 표시
2. **상태 표시**: ✅ 완료, 🔄 진행 중, ⏳ 대기, ❌ 중단
3. **대상 명시**: "참고 대상" 섹션 포함
4. **실행 가능**: 코드 예제, 명령어 포함
5. **최신 유지**: 프로젝트 변경 시 관련 문서 업데이트

---

## 🗂️ 문서 정리 히스토리

### 2025-01-22 대규모 정리
- ❌ 제거: 중복 Mureka 문서 7개 통합 → 1개
- ❌ 제거: Outdated Phase 4-6 문서
- ❌ 제거: 구현 가이드 중복 문서
- ✅ 생성: 명확한 폴더 구조 (4개 카테고리)
- ✅ 생성: 이 README.md

### 기존 문서 수: ~30개
### 정리 후 문서 수: 7개 (+ 루트 3개)
### 감소율: ~77%

---

**문서 관리 책임**: 프로젝트 리드, 각 팀 리드
**문의**: CLAUDE.md 참고
