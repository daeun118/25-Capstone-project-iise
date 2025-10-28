# ReadTune 음악 생성 API 가이드

> **작성일**: 2025-10-28  
> **목적**: 독서 여정별 맞춤 음악 생성 시스템의 구조와 설정을 공유

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [3단계 음악 생성 플로우](#3단계-음악-생성-플로우)
3. [GPT-4o-mini 설정](#gpt-4o-mini-설정)
4. [프롬프트 전략](#프롬프트-전략)
5. [크로스페이드 최적화](#크로스페이드-최적화)
6. [API 사용 예시](#api-사용-예시)
7. [응답 형식](#응답-형식)
8. [환경 변수 설정](#환경-변수-설정)

---

## 시스템 개요

ReadTune의 음악 생성 시스템은 **GPT-4o-mini**를 활용하여 독서 여정의 각 단계마다 맞춤형 음악 프롬프트를 생성합니다.

**아키텍처**:
```
User Input (독서 기록) 
  → GPT-4o-mini (프롬프트 생성) 
  → Mureka API (음악 생성) 
  → Supabase Storage (파일 저장)
  → User Playlist (자동 재생)
```

**핵심 파일**: `src/lib/openai/client.ts` → `generateMusicPrompt()`

---

## 3단계 음악 생성 플로우

### 1. v0 - 여정의 시작 (Start)

**타이밍**: 책을 선택하고 독서 여정을 처음 시작할 때

**입력 데이터**:
- `bookTitle`: 책 제목
- `bookDescription`: 책 설명 (선택)
- `bookCategory`: 책 카테고리 (선택)

**생성 전략**:
- 책 정보만으로 **anticipatory mood** (기대감) 조성
- 독서 시작 전의 **contemplative** (사색적) 분위기
- 다양한 감정으로 전환 가능한 **중립적 출발점**

**프롬프트 특징**:
```typescript
// v0 프롬프트 구조
Generate a music prompt for the beginning of a reading journey.
Book: {bookTitle}
Description: {bookDescription}
Category: {bookCategory}

Create a contemplative, anticipatory mood that represents the start of a reading journey.
IMPORTANT: 
- Start with a soft, gradual introduction (first 5-10 seconds)
- Use a moderate tempo (70-90 BPM) that can transition smoothly to various moods
- End with a gentle fade-out suitable for crossfading
- Include "ambient introduction with smooth transitions" in the prompt
```

**예상 출력**:
- Tempo: 70-90 BPM (중간 속도)
- Genre: Ambient, Neo-classical, Downtempo
- Mood: Contemplative, Anticipatory, Curious

---

### 2. vN - 독서 중 (Progress)

**타이밍**: 독서 과정에서 기록을 추가할 때 (v1, v2, v3...)

**입력 데이터**:
- 이전 로그 최근 2개 (`previousLogs.slice(-2)`)
  - 인용구 (`quote`)
  - 감정 태그 (`emotions`)
  - 이전 트랙 메타데이터 (`musicGenre`, `musicMood`, `musicTempo`)
- 현재 사용자 입력 (`userInput`)
  - 새 인용구
  - 새 감정 태그
  - 사용자 메모

**생성 전략**:
- **누적 컨텍스트 활용**: 이전 트랙과의 연속성 유지
- **템포 일관성**: ±10 BPM 범위 내에서 변화
- **장르 호환성**: 크로스페이드 가능한 장르 선택
- **감정 진화**: 독서 과정의 감정 변화 반영

**프롬프트 특징**:
```typescript
// vN 프롬프트 구조
Generate a music prompt for a moment in an ongoing reading journey.
Book: {bookTitle}

Previous track context:
- Genre: {prevGenre}
- Mood: {prevMood}
- Tempo: {prevTempo} BPM

Previous journey moments: (최근 2개만)
Moment 1: {quote, emotions}
Moment 2: {quote, emotions}

Current moment:
Quote: {userInput.quote}
Emotions: {userInput.emotions}
Reflection: {userInput.memo}

Create music that reflects this moment while maintaining connection to the journey so far.
IMPORTANT:
- Keep tempo within {prevTempo - 10} to {prevTempo + 10} BPM for smooth transitions
- Ensure genre compatibility with {prevGenre} for crossfading
- Include "smooth fade-in from {prevMood} mood" in the opening
- End with a gentle fade suitable for transitioning to the next track
```

**예상 출력**:
- Tempo: prevTempo ± 10 BPM
- Genre: prevGenre와 호환되는 장르
- Mood: 사용자의 현재 감정 반영

---

### 3. vFinal - 여정의 완성 (Complete)

**타이밍**: 책을 완독하고 독서 여정을 마무리할 때

**입력 데이터**:
- **전체 로그 히스토리** (`previousLogs`)
  - 모든 인용구, 감정, 반성
  - 모든 트랙의 메타데이터
- 마지막 사용자 입력 (`userInput`)
  - 완독 소감
  - 최종 감정

**생성 전략**:
- **전체 여정 통합**: 모든 로그를 종합하여 **synthesis**
- **그랜드 피날레**: 독서 여정의 완성도를 음악으로 표현
- **연장된 아웃트로**: 15-20초 페이드아웃으로 감동적 마무리
- **크로스페이드 최적화**: 마지막 트랙과 부드러운 연결

**프롬프트 특징**:
```typescript
// vFinal 프롬프트 구조
Generate a finale music prompt that synthesizes an entire reading journey.
Book: {bookTitle}

Previous track context:
- Last genre: {lastGenre}
- Last tempo: {lastTempo} BPM

Previous journey moments: (전체 로그)
Moment 1: {quote, emotions, memo}
Moment 2: {quote, emotions, memo}
...
Moment N: {quote, emotions, memo}

Final reflection:
Final quote: {userInput.quote}
Final emotions: {userInput.emotions}
Final thoughts: {userInput.memo}

Create a conclusive, synthesizing piece that brings closure to the reading journey.
IMPORTANT:
- Begin with a smooth crossfade from {lastGenre} at {lastTempo} BPM
- Gradually evolve to a grand finale while maintaining tempo within ±15 BPM
- Include an extended outro (15-20 seconds) with gradual fade-out
- Make it "suitable for seamless crossfading from previous track"
```

**예상 출력**:
- Tempo: lastTempo ± 15 BPM (변화 허용 범위 확대)
- Genre: 장엄하고 종합적인 장르 (Orchestral, Cinematic 등)
- Mood: Conclusive, Reflective, Triumphant

---

## GPT-4o-mini 설정

### 모델 설정

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',              // 모델명
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  response_format: { type: 'json_object' },  // JSON 응답 강제
  temperature: 0.8,                   // 창의성 수준
})
```

### 파라미터 설명

| 파라미터 | 값 | 이유 |
|---------|-----|------|
| `model` | `gpt-4o-mini` | 비용 효율적이면서 고품질 프롬프트 생성 |
| `temperature` | `0.8` | 창의적인 음악 프롬프트 생성 (0=결정적, 1=창의적) |
| `response_format` | `{ type: 'json_object' }` | 구조화된 JSON 응답 보장 |
| `messages` | System + User | System: 역할 정의, User: 구체적 요청 |

### Context Window 최적화

**최근 2개 로그만 사용** (`previousLogs.slice(-2)`):
- **이유**: GPT-4o-mini의 컨텍스트 제한 + 비용 최적화
- **효과**: 가장 최근 감정 변화에 집중, 토큰 사용량 40% 감소
- **예외**: vFinal에서는 전체 로그 사용 (여정 전체 통합)

---

## 프롬프트 전략

### System Prompt (공통)

```typescript
You are a music prompt generator for an AI music creation system.
Generate detailed music prompts that capture the essence of a reading journey.
Return a JSON object with: prompt (string), genre (string), mood (string), tempo (number), description (string).

CROSSFADE OPTIMIZATION RULES:
1. Maintain tempo consistency (±10-15 BPM variation between tracks)
2. Request gentle fade-in/fade-out capabilities in the prompt
3. Ensure smooth transitions by using compatible genres and moods
4. Include "suitable for crossfading" or "smooth transitions" in prompts
5. For endings: request "gradual fade-out" or "gentle conclusion"
6. For beginnings: request "soft introduction" or "gradual build-up"

IMPORTANT: The 'description' field should be a brief Korean summary (1-2 sentences) 
explaining the music's core mood and theme for users to understand.
```

### 핵심 전략

1. **템포 일관성 유지**: ±10-15 BPM 범위 내 변화로 크로스페이드 최적화
2. **페이드 인/아웃 명시**: 프롬프트에 "gentle fade-out", "soft introduction" 포함
3. **장르 호환성**: 전환 가능한 장르 조합 선택
4. **한국어 설명**: 사용자를 위한 간결한 한국어 요약 (1-2문장)

---

## 크로스페이드 최적화

### 크로스페이드란?

두 음악 트랙 사이를 부드럽게 전환하는 오디오 기법:
- **Equal Power Crossfade**: 일정한 음량 유지 (cosine/sine 곡선)
- **Duration**: 5-10초 (템포/무드 기반 적응)
- **Preloading**: 현재 트랙 종료 15초 전 다음 트랙 로드

### GPT-4o-mini 최적화 규칙

1. **템포 일관성**: 트랙 간 ±10-15 BPM 변화로 리듬 일치
2. **페이드 인/아웃**: 프롬프트에 페이드 요청 명시
3. **장르 호환성**: 크로스페이드 가능한 장르 선택
4. **무드 전환**: 급격한 감정 변화 방지

### 프롬프트 예시

```
v1 → v2 전환:
- v1 끝: "...ending with a gentle fade-out suitable for crossfading"
- v2 시작: "Begin with a smooth fade-in from melancholic mood, maintaining 75 BPM..."
```

### AudioCrossfadeManager

**파일**: `src/services/audio-crossfade-manager.ts`

**주요 기능**:
- Web Audio API 기반 Equal Power Crossfade
- Adaptive duration (5-10초, tempo/mood 기반)
- 15초 preloading으로 끊김 없는 재생

---

## API 사용 예시

### 1. v0 생성 (여정 시작)

```typescript
import { generateMusicPrompt } from '@/lib/openai/client'

const v0Prompt = await generateMusicPrompt({
  bookTitle: '1984',
  bookDescription: 'George Orwell의 디스토피아 소설',
  bookCategory: '소설',
})

// 응답 예시:
// {
//   prompt: "Ambient dystopian soundscape with subtle tension...",
//   genre: "Dark Ambient",
//   mood: "Ominous, Contemplative",
//   tempo: 75,
//   description: "조지 오웰의 암울한 세계관을 반영한 긴장감 있는 앰비언트 음악"
// }
```

### 2. vN 생성 (독서 중)

```typescript
const v2Prompt = await generateMusicPrompt({
  bookTitle: '1984',
  previousLogs: [
    {
      quote: "Big Brother is watching you",
      emotions: ['불안', '긴장'],
      musicGenre: 'Dark Ambient',
      musicMood: 'Ominous',
      musicTempo: 75,
    },
    {
      quote: "War is peace, freedom is slavery",
      emotions: ['혼란', '분노'],
      musicGenre: 'Industrial',
      musicMood: 'Tense',
      musicTempo: 80,
    }
  ],
  userInput: {
    quote: "If you want a picture of the future...",
    emotions: ['절망', '공포'],
    memo: '디스토피아의 진정한 의미를 깨달았다'
  },
})

// 응답 예시:
// {
//   prompt: "Evolving from industrial tension to haunting despair, smooth fade-in from tense mood at 80 BPM...",
//   genre: "Dark Industrial",
//   mood: "Despair, Haunting",
//   tempo: 85,
//   description: "산업적 긴장감에서 절망적인 공포로 진화하는 어두운 사운드스케이프"
// }
```

### 3. vFinal 생성 (완독)

```typescript
const vFinalPrompt = await generateMusicPrompt({
  bookTitle: '1984',
  previousLogs: [
    // 전체 독서 로그 (v0 ~ vN)
    { quote: "...", emotions: [...], musicGenre: "...", ... },
    { quote: "...", emotions: [...], musicGenre: "...", ... },
    // ...
  ],
  userInput: {
    quote: "He loved Big Brother",
    emotions: ['비애', '체념'],
    memo: '인간 정신의 완전한 파괴를 목격했다'
  },
  isFinal: true,
})

// 응답 예시:
// {
//   prompt: "Grand finale synthesizing the journey from dystopian tension to tragic resignation, smooth crossfade from dark industrial at 85 BPM, extended outro with gradual fade-out...",
//   genre: "Cinematic Dark Orchestral",
//   mood: "Tragic, Reflective, Conclusive",
//   tempo: 90,
//   description: "디스토피아적 긴장에서 비극적 체념까지, 독서 여정 전체를 통합한 장엄한 피날레"
// }
```

---

## 응답 형식

### JSON Schema

```typescript
interface MusicPromptResponse {
  prompt: string       // Mureka API에 전달할 상세 음악 프롬프트
  genre: string        // 음악 장르 (예: "Dark Ambient", "Neo-classical")
  mood: string         // 음악 분위기 (예: "Contemplative, Tense")
  tempo: number        // BPM (예: 75)
  description: string  // 한국어 설명 (1-2문장)
}
```

### 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|-----|------|------|------|
| `prompt` | string | Mureka API에 전달할 상세 프롬프트 (영문) | "Ambient dystopian soundscape with subtle tension, gradual fade-out..." |
| `genre` | string | 음악 장르 | "Dark Ambient", "Neo-classical", "Cinematic" |
| `mood` | string | 음악 분위기 (쉼표로 구분) | "Ominous, Contemplative", "Melancholic, Reflective" |
| `tempo` | number | BPM (분당 비트 수) | 75, 80, 120 |
| `description` | string | 사용자를 위한 한국어 설명 (1-2문장) | "조지 오웰의 암울한 세계관을 반영한 긴장감 있는 앰비언트 음악" |

---

## 환경 변수 설정

### .env.local

```bash
# OpenAI API Key (필수)
OPENAI_API_KEY=sk-proj-...

# Mureka API (음악 생성 - 현재 미구현)
MUREKA_API_KEY=...
```

### Vercel 배포 설정

1. Vercel Dashboard → Project → Settings → Environment Variables
2. `OPENAI_API_KEY` 추가 (Production, Preview, Development 모두)
3. Redeploy

---

## 추가 자료

### 관련 파일

- **API 클라이언트**: `src/lib/openai/client.ts`
- **크로스페이드 매니저**: `src/services/audio-crossfade-manager.ts`
- **음악 플레이어 훅**: `src/hooks/useMusicPlayer.ts`
- **플레이어 UI**: `src/components/music/MusicPlayerBar.tsx`
- **E2E 테스트**: `tests/playlist-crossfade.spec.ts`

### 참고 문서

- [OpenAI API - Chat Completions](https://platform.openai.com/docs/api-reference/chat)
- [Web Audio API - GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode)
- [Equal Power Crossfade](https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch04.html#s04_3)

---

**마지막 업데이트**: 2025-10-28  
