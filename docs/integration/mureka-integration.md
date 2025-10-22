# Mureka AI 음악 생성 통합 가이드

**최종 업데이트**: 2025-10-22
**상태**: ✅ 구현 완료 - 사용자 설정 필요

---

## 📖 개요

BookBeats 플랫폼에 Mureka AI 음악 생성을 통합하여 독서 여정마다 실제 음악 파일을 자동 생성합니다.

### 아키텍처

```
사용자 독서 기록 추가
    ↓
OpenAI GPT-4o-mini (음악 프롬프트 생성)
    ↓
DB에 placeholder 생성 (status: pending)
    ↓
즉시 사용자에게 응답 반환
    ↓
[비동기 백그라운드 프로세스]
    ↓
Mureka AI (실제 음악 생성, 30초~2분)
    ↓
Supabase Storage 업로드
    ↓
DB 업데이트 (status: completed, file_url)
    ↓
프론트엔드 상태 폴링
    ↓
음악 재생 가능
```

---

## ✅ 구현 완료 사항

### 1. 핵심 컴포넌트

**Mureka API 클라이언트** (`src/lib/mureka/client.ts`)
- `generateBackgroundMusic()` - 메인 음악 생성 함수
- `checkMurekaStatus()` - API 상태 및 크레딧 확인
- MCP 및 직접 API 통합 지원
- 타임아웃 설정 (기본 500초)
- 에러 처리 및 재시도 로직

**Supabase Storage 통합** (`src/lib/mureka/storage.ts`)
- `uploadMusicFile()` - 생성된 음악 업로드
- `downloadMusicFile()` - Mureka URL에서 다운로드
- `deleteMusicFile()` - 파일 삭제
- `getMusicFileMetadata()` - 파일 정보 조회
- 버킷 구조: `music-tracks/{journey_id}/{track_id}.mp3`

**MusicService 업데이트** (`src/services/music.service.ts`)
- 3가지 음악 타입 모두 Mureka 통합 (v0, vN, vFinal)
- 비동기 fire-and-forget 패턴
- 자동 상태 추적 (pending → completed/error)
- 백그라운드 음악 파일 처리

**음악 상태 API** (`src/app/api/music/[id]/route.ts`)
- `GET /api/music/[id]` - 음악 생성 상태 폴링
- 트랙 상태, 파일 URL, 메타데이터 반환
- 프론트엔드 "생성 중..." 상태 표시

### 2. 음악 생성 타입

**v0 - 여정 시작**
- 입력: 책 메타데이터만
- 스타일: 기대감, 사색적
- 예시: "쿠바 바다의 고독한 항해를 표현하는 잔잔한 앰비언트 음악"

**vN - 독서 중**
- 입력: 최근 2개 로그 + 현재 감정
- 스타일: 이전 음악과 연결되면서 새로운 감정 반영
- 누적 컨텍스트 유지

**vFinal - 완독**
- 입력: 전체 여정 히스토리 + 최종 감상
- 스타일: 여정 전체를 아우르는 피날레
- 종결감 있는 음악

---

## 🔧 사용자 설정 가이드

### 1단계: Mureka 계정 설정

1. [Mureka Platform](https://platform.mureka.ai/apiKeys) 방문
2. 계정 생성 또는 로그인
3. API Keys 섹션으로 이동
4. 새 API 키 생성
5. Mureka 크레딧 구매 (음악 생성에 필요)

### 2단계: UV 패키지 매니저 설치

UV는 Mureka MCP 서버 실행에 필요합니다.

**Windows:**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 3단계: .mcp.json 설정

`.mcp.json` 파일에 Mureka MCP 서버 추가:

```json
{
  "mcpServers": {
    "mureka": {
      "command": "uvx",
      "args": ["mureka-mcp"],
      "env": {
        "MUREKA_API_KEY": "your_api_key_here",
        "MUREKA_API_URL": "https://api.mureka.ai",
        "TIME_OUT_SECONDS": "500"
      }
    }
  }
}
```

### 4단계: 환경 변수 설정

`.env.local` 파일에 추가:

```env
# Mureka Music Generation
MUREKA_API_KEY=your_api_key_here
MUREKA_API_URL=https://api.mureka.ai
MUREKA_TIMEOUT_SECONDS=500
MUREKA_MCP_ENABLED=false  # 프로덕션: false, 개발: true
```

### 5단계: Supabase Storage 설정

Supabase Dashboard에서 SQL 실행:

```sql
-- music-tracks 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-tracks', 'music-tracks', true);

-- RLS 정책
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'music-tracks');

CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music-tracks');

CREATE POLICY "Service role update"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'music-tracks');

CREATE POLICY "Service role delete"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'music-tracks');
```

---

## 🧪 테스트 방법

### 수동 테스트 (권장)

```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저에서 테스트
# - http://localhost:3000 접속
# - 회원가입/로그인
# - 새 독서 여정 시작
# - 독서 기록 추가
# - 서버 로그 확인
```

**예상 로그:**
```
✅ GPT-4o-mini 프롬프트 생성 완료
🎵 Mureka 음악 생성 시작 (비동기)
⏳ 프론트엔드에 즉시 응답 반환
[30-120초 후]
✅ Mureka 음악 생성 완료
✅ Supabase Storage 업로드 완료
✅ DB 업데이트: status=completed
```

### 검증 스크립트

```bash
# 설정 검증
node scripts/verify-mureka-setup.js

# Mureka API 직접 테스트
node scripts/test-mureka-api.js

# E2E 플로우 테스트
node scripts/test-music-flow.js
```

---

## 🎯 사용 가능한 Mureka MCP 도구

Claude Code에서 사용 가능한 4가지 도구:

1. **Generate Lyrics** - 가사 생성
2. **Generate Song** - 보컬 포함 곡 생성
3. **Generate Background Music** - 인스트루멘탈 BGM 생성 ⭐ (BookBeats 사용)
4. **Generate from Lyrics** - 기존 가사로 곡 생성

BookBeats는 **Generate Background Music**을 사용하여 독서 분위기에 맞는 인스트루멘탈 트랙을 생성합니다.

---

## 💰 비용 추정

### Mureka 크레딧 소비

- **1곡 생성**: ~10 크레딧
- **평균 독서 여정**: 3-5곡 (v0 + vN×2-4 + vFinal)
- **크레딧 소비**: 30-50 크레딧/여정

### 예상 비용 (참고)

실제 비용은 Mureka 요금제에 따라 다릅니다.
[Mureka Pricing](https://platform.mureka.ai/pricing) 참고

---

## ❗ 문제 해결

### 문제 1: "Mureka MCP not found"

**원인**: UV가 설치되지 않았거나 PATH에 없음

**해결**:
```bash
# UV 설치 확인
uv --version

# PATH에 추가 (Windows)
$env:PATH += ";$HOME\.cargo\bin"

# PATH에 추가 (macOS/Linux)
export PATH="$HOME/.cargo/bin:$PATH"
```

### 문제 2: "Insufficient credits"

**원인**: Mureka 크레딧 부족

**해결**:
1. [Mureka Platform](https://platform.mureka.ai) 접속
2. Credits 구매
3. API 키 활성화 확인

### 문제 3: 음악 생성 타임아웃

**원인**: 네트워크 불안정 또는 Mureka 서버 부하

**해결**:
```env
# .env.local에서 타임아웃 증가
MUREKA_TIMEOUT_SECONDS=600  # 10분
```

### 문제 4: Storage 업로드 실패

**원인**: RLS 정책 미설정

**해결**:
1. Supabase Dashboard → Storage
2. music-tracks 버킷 확인
3. RLS 정책 재생성 (5단계 SQL 실행)

---

## 📚 관련 문서

- [실행 계획](../../execution_plan.md) - Phase 5 음악 생성 구현
- [CLAUDE.md](../../CLAUDE.md) - 3단계 음악 생성 로직
- [디자인 시스템](../architecture/design-system.md) - 음악 플레이어 UI

---

## 🔄 향후 개선 사항

- [ ] 음악 생성 진행률 표시 (Mureka API 진행률 지원 시)
- [ ] 음악 재생성 기능 (만족하지 않은 경우)
- [ ] 음악 스타일 커스터마이징 (템포, 장르 선택)
- [ ] 음악 다운로드 기능 (Phase 2)
- [ ] 음악 공유 기능 (SNS 연동)
