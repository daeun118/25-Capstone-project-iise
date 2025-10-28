# 회원탈퇴 기능 가이드

**구현 완료**: 2025-10-28  
**아키텍처**: Repository → Service → API → UI

---

## 📋 구현 개요

GDPR/개인정보보호법을 준수하는 안전한 회원탈퇴 기능.

**핵심 특징**:
- ✅ 비밀번호 재확인 (2단계 인증)
- ✅ 완전한 데이터 삭제 (DB + Storage)
- ✅ 레이어드 아키텍처
- ✅ 사용자 친화적 UI

---

## 🏗️ 아키텍처

```
UI (DeleteAccountDialog)
  ↓
API (/api/user/delete)
  ↓
Service (UserService)
  ↓
Repository (UserRepository)
  ↓
Database (Supabase)
```

---

## 🗑️ 삭제 순서 (Cascade)

```sql
-- 1. 연결 테이블
DELETE FROM log_emotions WHERE log_id IN (...)
DELETE FROM comments WHERE user_id = ?
DELETE FROM likes WHERE user_id = ?
DELETE FROM bookmarks WHERE user_id = ?

-- 2. 핵심 데이터
DELETE FROM posts WHERE user_id = ?
DELETE FROM reading_logs WHERE journey_id IN (...)
DELETE FROM music_tracks WHERE id IN (...)
DELETE FROM reading_journeys WHERE user_id = ?

-- 3. 사용자 계정
DELETE FROM users WHERE id = ?
supabase.auth.admin.deleteUser(userId)
```

**주의**: CASCADE 설정 없음 → 수동 순서 삭제 필수

---

## 📁 Storage 파일 삭제

```typescript
// 1. 프로필 이미지
avatars/{userId}/*

// 2. 음악 파일
music/{userId}/*

// 3. 앨범 커버
album-covers/{journeyId}/*
```

**삭제 전략**: Storage 먼저 → DB 나중 (고아 파일 방지)

---

## 🔒 보안

- **비밀번호 재확인**: `supabase.auth.signInWithPassword`
- **세션 검증**: API Route에서 `getUser()` 확인
- **Service Role Key**: Admin API 호출용
- **2단계 확인**: 경고 모달 + 비밀번호 + 체크박스

---

## 📝 구현 파일

1. **Repository**: `src/repositories/user.repository.ts`
2. **Service**: `src/services/user.service.ts`
3. **API**: `src/app/api/user/delete/route.ts`
4. **UI**: `src/components/my/DeleteAccountDialog.tsx`
5. **페이지**: `src/app/(main)/my/page.tsx`

---

## 🧪 테스트

```bash
# E2E 테스트
npx playwright test tests/e2e/auth/delete-account.spec.ts
```

**테스트 시나리오**:
- 버튼 표시 확인
- 모달 열림/닫힘
- 경고 메시지 표시
- 비밀번호 입력 검증
- 체크박스 검증

---

## ⚠️ 주의사항

### 환경 변수 필수

```env
SUPABASE_SERVICE_ROLE_KEY=...  # Admin API용
```

### Production 배포 전

- [ ] 테스트 계정으로 검증
- [ ] DB/Storage 삭제 확인
- [ ] Vercel 환경 변수 설정

---

**작성**: Claude Code  
**구현 시간**: 2025-10-28
