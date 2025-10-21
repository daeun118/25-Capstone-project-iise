# Database Migration Guide

## Migration: Fix music_tracks Field Lengths (2025-10-21)

### Problem
독서 기록 생성 시 다음 에러 발생:
```
PostgreSQL Error 22001: value too long for type character varying(200)
```

### Root Cause
`music_tracks` 테이블의 필드들이 GPT-4o-mini가 생성하는 콘텐츠를 담기에 너무 작음:
- `description` VARCHAR(200) - GPT가 200자 넘는 설명 생성
- `genre` VARCHAR(50) - "classical crossover with electronic elements" 같은 복합 장르는 50자 초과
- `mood` VARCHAR(50) - "contemplative and melancholic with undertones of hope" 같은 상세 무드는 50자 초과

### Solution
필드 크기를 넉넉하게 확장:
- `description`: VARCHAR(200) → **TEXT** (무제한)
- `genre`: VARCHAR(50) → **VARCHAR(100)**
- `mood`: VARCHAR(50) → **VARCHAR(100)**

---

## 실행 방법

### Option 1: Supabase Dashboard (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴: SQL Editor
   - "New Query" 클릭

3. **마이그레이션 SQL 복사**
   ```sql
   -- Migration: Fix music_tracks field length constraints
   -- Date: 2025-10-21

   ALTER TABLE music_tracks
     ALTER COLUMN description TYPE TEXT;

   ALTER TABLE music_tracks
     ALTER COLUMN genre TYPE VARCHAR(100);

   ALTER TABLE music_tracks
     ALTER COLUMN mood TYPE VARCHAR(100);

   COMMENT ON COLUMN music_tracks.description IS 'AI-generated description of the music (no length limit)';
   COMMENT ON COLUMN music_tracks.genre IS 'Music genre (up to 100 characters)';
   COMMENT ON COLUMN music_tracks.mood IS 'Emotional mood (up to 100 characters)';
   ```

4. **실행**
   - "Run" 버튼 클릭
   - 성공 메시지 확인: "Success. No rows returned"

5. **검증**
   ```sql
   -- 스키마 확인
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'music_tracks'
   AND column_name IN ('description', 'genre', 'mood');
   ```

   **예상 결과**:
   ```
   description | text      | null
   genre       | varchar   | 100
   mood        | varchar   | 100
   ```

---

### Option 2: Supabase CLI (로컬 개발용)

```bash
# 1. Supabase CLI 설치 (아직 안했다면)
npm install -g supabase

# 2. Supabase 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref oelgskajaisratnbffip

# 4. 마이그레이션 실행
supabase db push

# 5. 타입 재생성
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

---

## 마이그레이션 후 확인 사항

### 1. TypeScript 타입 재생성
```bash
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

### 2. 기존 데이터 확인
```sql
-- 기존 music_tracks 레코드 확인
SELECT id,
       LENGTH(description) as desc_len,
       LENGTH(genre) as genre_len,
       LENGTH(mood) as mood_len
FROM music_tracks
WHERE LENGTH(description) > 200
   OR LENGTH(genre) > 50
   OR LENGTH(mood) > 50;
```

**참고**: 이 쿼리가 결과를 반환하지 않으면 정상입니다. (아직 200자 넘는 데이터가 없음)

### 3. 독서 기록 생성 재테스트
1. 개발 서버 재시작: `npm run dev`
2. 브라우저에서 `/journey/[id]` 접속
3. "기록 추가" 클릭
4. 메모 입력 + 감정 태그 선택
5. "저장" 클릭
6. ✅ 성공 확인: 토스트 "독서 기록이 추가되었습니다! 음악 생성 중..."

---

## 롤백 (필요시)

만약 문제가 생기면 원래대로 되돌릴 수 있습니다:

```sql
-- 롤백 SQL
ALTER TABLE music_tracks
  ALTER COLUMN description TYPE VARCHAR(200);

ALTER TABLE music_tracks
  ALTER COLUMN genre TYPE VARCHAR(50);

ALTER TABLE music_tracks
  ALTER COLUMN mood TYPE VARCHAR(50);
```

**주의**: 롤백 전에 기존 데이터를 확인하세요. 이미 200자 넘는 description이 있으면 롤백 시 데이터 손실 가능.

---

## 예상 효과

### Before (에러 발생)
```
POST /api/journeys/[id]/logs
500 Internal Server Error
"value too long for type character varying(200)"
```

### After (정상 작동)
```
POST /api/journeys/[id]/logs
200 OK
{
  "log": { ... },
  "musicTrack": {
    "description": "A contemplative and introspective musical piece that captures...(300자)",
    "genre": "ambient classical with electronic undertones",
    "mood": "melancholic yet hopeful with undertones of determination"
  }
}
```

---

## 참고 자료

- 마이그레이션 파일: `supabase/migrations/20251021_fix_music_tracks_field_lengths.sql`
- 테스트 리포트: `docs/PHASE5_TEST_REPORT.md`
- 스키마 정의: `execution_plan.md` Phase 1
