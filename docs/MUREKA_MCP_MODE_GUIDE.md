# Mureka MCP Mode 사용 가이드

## 개요

`MUREKA_MCP_ENABLED=true`로 설정하면 Mureka MCP 모드가 활성화됩니다. 
이 모드에서는 별도의 브리지 스크립트가 음악 생성을 처리합니다.

## 아키텍처

```
Next.js API Route → 음악 트랙 생성 (status: pending)
                    ↓
                    즉시 응답 반환
                    ↓
Mureka MCP Bridge → 데이터베이스 폴링
                    ↓
                    Pending 트랙 발견
                    ↓
                    Mureka API 호출 또는 MCP 도구 사용
                    ↓
                    음악 파일 생성
                    ↓
                    Supabase Storage 업로드
                    ↓
                    DB 업데이트 (status: completed)
```

## 설정 방법

### 1. 환경 변수 설정 (.env.local)

```env
# Mureka MCP 모드 활성화
MUREKA_MCP_ENABLED=true

# Mureka API 설정
MUREKA_API_KEY=op_mgxw709q8WwRLVaLiySHMRU2PSWAkT7
MUREKA_API_URL=https://api.mureka.ai
MUREKA_TIMEOUT_SECONDS=300
```

### 2. 개발 서버 실행

MCP 모드로 실행하려면 두 가지 옵션이 있습니다:

#### 옵션 1: 통합 실행 (권장)
```bash
npm run dev:with-mureka
```
이 명령은 Next.js 개발 서버와 Mureka 브리지를 동시에 실행합니다.

#### 옵션 2: 개별 실행
터미널 1:
```bash
npm run dev
```

터미널 2:
```bash
npm run mureka:bridge
```

### 3. 음악 생성 테스트

1. 브라우저에서 http://localhost:3000 접속
2. 로그인 (ehgks904@naver.com / zoqtmxjselwkdls)
3. 새 독서 여정 시작
4. 독서 기록 추가
5. 브리지 스크립트 로그 확인:
   ```
   [MCP Bridge] Found 1 pending track(s)
   [MCP Bridge] Processing track {id}...
   [MCP Bridge] ✅ Successfully generated music for track {id}
   ```

## 동작 방식

### MCP 모드가 활성화되면:

1. **API Route** (`/api/music/generate/[id]`):
   - 트랙 상태를 'pending'으로 유지
   - 즉시 응답 반환 (비차단)

2. **브리지 스크립트** (`mureka-mcp-bridge.js`):
   - 5초마다 'pending' 상태 트랙 확인
   - Mureka API 호출하여 음악 생성
   - 생성된 파일을 Supabase Storage 업로드
   - DB 상태를 'completed'로 업데이트

3. **프론트엔드**:
   - 2초마다 `/api/music/[id]` 폴링
   - 상태가 'completed'가 되면 음악 재생

## 문제 해결

### 브리지가 트랙을 처리하지 않는 경우

1. 브리지 스크립트가 실행 중인지 확인:
   ```bash
   ps aux | grep mureka-mcp-bridge
   ```

2. 환경 변수 확인:
   ```bash
   echo $MUREKA_API_KEY
   echo $MUREKA_MCP_ENABLED
   ```

3. 데이터베이스에서 pending 트랙 확인:
   ```sql
   SELECT * FROM music_tracks WHERE status = 'pending';
   ```

### Mureka API 404 에러

현재 Mureka API의 정확한 엔드포인트를 모르기 때문에 404 에러가 발생할 수 있습니다.
실제 Mureka API 문서를 받으면 다음 파일을 업데이트하세요:

- `src/lib/mureka/client.ts` - generateViaAPI() 함수의 엔드포인트
- `scripts/mureka-generate.py` - 엔드포인트 목록

### 로그 확인

브리지 스크립트 로그:
```bash
[MCP Bridge] Checking for pending music tracks...
[MCP Bridge] Found 1 pending track(s)
[MCP Bridge] Processing track {id}...
[MCP Output] Generating background music...
[MCP Bridge] Uploading file to Supabase Storage...
[MCP Bridge] ✅ Successfully generated music for track {id}
```

서버 로그:
```bash
[Mureka] MCP mode enabled - track will be processed by bridge script
[Music Generate API] Starting generation for track {id}...
```

## 주의 사항

1. **MCP 도구 직접 호출 불가**: 
   - Next.js 서버는 MCP 도구를 직접 호출할 수 없습니다
   - 브리지 스크립트가 중개 역할을 합니다

2. **브리지 스크립트 필수**:
   - MCP 모드에서는 브리지 스크립트가 반드시 실행되어야 합니다
   - 브리지 없이는 음악이 생성되지 않습니다

3. **개발 환경 전용**:
   - 이 설정은 개발 환경용입니다
   - 프로덕션에서는 적절한 job queue 시스템을 사용하세요

## 프로덕션 배포

프로덕션에서는 다음과 같은 방법을 권장합니다:

1. **Job Queue 사용** (Bull, BullMQ 등)
2. **Serverless Functions** (Vercel Functions, AWS Lambda)
3. **Webhook 기반** (Mureka가 완료 시 콜백)
4. **Direct API** (MUREKA_MCP_ENABLED=false로 설정)

## 요약

- `MUREKA_MCP_ENABLED=true`: MCP 브리지 모드 활성화
- `npm run dev:with-mureka`: 통합 개발 서버 실행
- 브리지 스크립트가 백그라운드에서 음악 생성 처리
- 프론트엔드는 폴링으로 완료 상태 확인

---

**참고**: 실제 Mureka API 엔드포인트가 확인되면 다음 파일들을 업데이트하세요:
- `src/lib/mureka/client.ts`
- `scripts/mureka-generate.py`
- `scripts/mureka-mcp-bridge.js`