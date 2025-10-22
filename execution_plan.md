# Reading Experience Platform - 실행 계획

**작성일:** 2025-10-20 (최종 수정: 2025-01-22)  
**개발 환경:** Claude Code  
**목표:** MVP 단계적 개발 및 배포  
**현재 상태:** Phase 10 완료 (마이페이지)

---

## Phase 0: 프로젝트 초기 세팅 ✅ 완료

**주요 기술 스택**:
- Next.js 15 + React 19
- Tailwind CSS v4 + shadcn/ui
- Supabase (DB, Auth, Storage)
- TypeScript, Zustand, Playwright



---

## Phase 1: 데이터베이스 구축 ✅ 완료

**주요 테이블**: users, reading_journeys, reading_logs, music_tracks, emotion_tags, log_emotions, posts, comments, likes, bookmarks

**Storage Buckets**: music, album-covers

**타입 생성**: `supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts`

---

## Phase 2: 인증 시스템 ✅ 완료

이메일/비밀번호, Google OAuth 구현 완료

---

## Phase 3: 도서 검색 ✅ 완료

Google Books API 연동, 검색 UI 구현 완료

---

## Phase 4: 독서 여정 - 시작 & v0 생성 ✅ 완료

여정 생성, v0 음악 프롬프트 생성 구현 완료 (GPT-4o-mini 연동)

**핵심**: `src/lib/openai/client.ts`의 3단계 음악 생성 로직

---

## Phase 5: 독서 기록 추가 & vN 생성 ✅ 완료

독서 기록 폼, 감정 태그, vN 프롬프트 생성, E2E 테스트 완료

**테스트 상태**:
- [x] 독서 기록 추가 ✅
- [x] 감정 태그 선택 + 커스텀 추가 ✅
- [x] vN 음악 프롬프트 생성 (이전 기록 참고) ✅
- [x] 독서 기록 타임라인 표시 ✅
- [x] Playwright E2E 테스트 ✅
- [ ] 실제 음악 파일 생성 (Mureka MCP - 추후 구현)

---

## Phase 6: 완독 & 최종 음악 ✅ 완료

완독 폼, vFinal 프롬프트 생성, 플레이리스트 UI 구현 완료

---

## Phase 7: 내 책장 ✅ 완료

여정 목록, 읽는 중/완독 탭, 여정 카드 구현 완료

---

## Phase 8: 게시판 ✅ 완료

피드, 게시물 카드, 상세 페이지, 필터/정렬 구현 완료

---

## Phase 9: 상호작용 ✅ 완료

좋아요, 댓글, 스크랩 기능 구현 완료

---

## Phase 10: 마이페이지 ✅ 완료

마이페이지, 보관함, 프로필 편집 구현 완료

---

## Phase 11: UI/UX 개선 🔄 진행 중

**계획**:
- 다크모드
- 반응형 디자인 최적화
- 접근성 개선
- 로딩/에러 UI 통일

---

## Phase 12: 배포 ⏳ 대기

Vercel 배포 준비 완료 (환경 변수 설정 필요)

---

## Phase 13: 앨범커버 생성 (P1) ⏳ 대기

DALL-E 3 연동 4컷 만화 스타일 앨범커버 (Phase 11 완료 후)

---

## 다음 단계

**우선순위**:
1. **Phase 11** (UI/UX 개선) - 다크모드, 반응형, 접근성
2. **Phase 12** (배포) - Vercel 프로덕션 배포
3. **Phase 13** (앨범커버) - DALL-E 3 연동

**미완료 기능**:
- Mureka MCP 실제 음악 생성 (현재 프롬프트만 생성)
- 실시간 업데이트 (Supabase Realtime)

**기술 부채**:
- 타입 안전성 개선 (any 타입 제거)
- 에러 처리 통일
- 성능 최적화 (이미지 lazy loading, 코드 스플리팅)

---

**이 계획은 Claude Code에서 단계별로 실행하면서 조정할 수 있습니다.**