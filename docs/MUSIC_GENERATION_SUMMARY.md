# Music Generation Integration - Summary

## ✅ What Was Implemented

I've successfully integrated **GPT-4o-mini + Mureka AI** into your Reading Experience Platform to automatically generate instrumental BGM based on users' reading journey.

## 🎯 Complete User Flow

```
1. User adds reading log (quote + emotions + memo)
   ↓
2. GPT-4o-mini generates contextual music prompt
   ↓
3. Mureka API creates instrumental BGM (no lyrics)
   ↓
4. Music file URL saved to database
   ↓
5. User can play the generated music
```

## 📁 Files Created/Modified

### New Files
- ✅ `src/services/mureka.service.ts` - Mureka API integration
- ✅ `scripts/test-mureka-api.js` - Test Mureka API directly
- ✅ `scripts/setup-test-journey.js` - Create test data
- ✅ `scripts/test-music-flow.js` - End-to-end test
- ✅ `docs/MUREKA_INTEGRATION.md` - Complete documentation

### Modified Files
- ✅ `src/app/api/music/generate/route.ts` - Integrated GPT + Mureka
- ✅ MCP configuration already exists in `.mcp.json`

### Unchanged (Already Working)
- ✅ `src/lib/openai/client.ts` - GPT prompt generation (no changes needed)
- ✅ `src/services/music.service.ts` - Music orchestration (no changes needed)
- ✅ `src/app/api/journeys/[id]/logs/route.ts` - Reading log creation (no changes needed)

## 🔑 Key Components

### 1. GPT-4o-mini Prompt Generation
```typescript
// Already implemented in src/lib/openai/client.ts
const promptData = await generateMusicPrompt({
  bookTitle: "노인과 바다",
  previousLogs: [...],  // Last 2 logs for context
  userInput: {
    quote: "고독은 두려운 것이 아니다...",
    emotions: ["고독", "의지", "감동"],
    memo: "주인공의 고독한 항해가 인상 깊었다..."
  }
});

// Output: {
//   prompt: "고독과 의지가 교차하는 순간을 표현하는 앰비언트 음악...",
//   genre: "ambient",
//   mood: "contemplative",
//   tempo: 60
// }
```

### 2. Mureka BGM Generation
```typescript
// New service: src/services/mureka.service.ts
const result = await generateBGM({
  prompt: promptData.prompt,
  genre: promptData.genre,
  mood: promptData.mood,
  tempo: promptData.tempo
});

// Output: {
//   mp3Url: "https://api.mureka.ai/...",
//   duration: 180000,  // milliseconds
//   taskId: "101389095141377"
// }
```

### 3. Music Generation API
```typescript
// Updated: src/app/api/music/generate/route.ts
POST /api/music/generate
Body: { "track_id": "uuid" }

// Integrates both GPT + Mureka:
// 1. Fetch prompt from music_tracks
// 2. Call Mureka API with prompt
// 3. Poll for completion (max 200 seconds)
// 4. Save MP3 URL to database
```

## 🎵 Music Generation Types

### v0 - Journey Start
- **Input**: Book metadata only
- **Style**: Anticipatory, contemplative
- **Example**: "쿠바 바다의 고독한 항해를 표현하는 잔잔한 앰비언트 음악"

### vN - During Reading
- **Input**: Previous logs + current emotions
- **Style**: Reflects emotional journey
- **Example**: "고독과 의지가 교차하는 순간을 표현하는 음악. 파도처럼 밀려오는 감정..."

### vFinal - Completion
- **Input**: All logs + final review
- **Style**: Synthesizing, conclusive
- **Example**: "전체 독서 여정을 종합한 피날레 음악..."

## ⚙️ Configuration

### Environment Variables (`.env.local`)
```env
# OpenAI (prompt generation)
OPENAI_API_KEY=sk-proj-...

# Mureka (music generation)
MUREKA_API_KEY=op_mgxw709q8WwRLVaLiySHMRU2PSWAkT7
MUREKA_API_URL=https://api.mureka.ai

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### MCP Configuration (`.mcp.json`)
```json
{
  "mureka": {
    "command": "uvx",
    "args": ["mureka-mcp"],
    "env": {
      "MUREKA_API_KEY": "...",
      "MUREKA_API_URL": "https://api.mureka.ai",
      "TIME_OUT_SECONDS": "500"
    }
  }
}
```

## 🧪 Testing

### 1. Test Mureka API
```bash
node scripts/test-mureka-api.js
```
Output: Verifies Mureka API connection and music generation

### 2. Setup Test Journey
```bash
node scripts/setup-test-journey.js
```
Output: Creates test user + journey + v0 music track

### 3. End-to-End Test
```bash
node scripts/test-music-flow.js
```
Output: Tests complete flow (user input → GPT → Mureka → music file)

## 📊 Database Schema

### music_tracks Table
```sql
- id: UUID
- prompt: TEXT (GPT-generated)
- genre: TEXT
- mood: TEXT
- tempo: INTEGER
- file_url: TEXT (Mureka MP3 URL)
- duration: INTEGER (seconds)
- mureka_task_id: VARCHAR
- status: VARCHAR (pending/generating/completed/error)
- error_message: TEXT
```

### Status Flow
```
pending → generating → completed
                    ↘ error
```

## ⏱️ Performance

- **GPT Prompt Generation**: 1-3 seconds
- **Mureka Music Generation**: 30-120 seconds
- **Total**: 31-123 seconds per track
- **Polling**: Every 5 seconds, max 40 attempts (200s)

## 🚀 How to Use (Frontend Integration)

### After Creating Reading Log
```typescript
// 1. User submits reading log
const response = await fetch(`/api/journeys/${journeyId}/logs`, {
  method: 'POST',
  body: JSON.stringify({
    quote: "인상 깊은 구절",
    memo: "독서 기록",
    emotions: ["고독", "의지"],
    isPublic: true
  })
});

const { log, musicTrack } = await response.json();

// 2. musicTrack.status === 'pending' → immediately trigger generation
if (musicTrack.status === 'pending') {
  const musicResponse = await fetch('/api/music/generate', {
    method: 'POST',
    body: JSON.stringify({ track_id: musicTrack.id })
  });
  
  const result = await musicResponse.json();
  
  if (result.success) {
    // 3. Play music: result.mp3_url
    console.log('Music URL:', result.mp3_url);
    // Update UI with music player
  }
}
```

## ⚠️ Important Notes

1. **Generation Time**: Music takes 30-120 seconds. Show loading state to user.
2. **Error Handling**: Check `result.success` and display `result.error` if failed.
3. **Status Tracking**: Track `music_tracks.status` in database:
   - `pending` → Show "준비 중..."
   - `generating` → Show "음악 생성 중... (30초~2분 소요)"
   - `completed` → Show music player with `file_url`
   - `error` → Show error message from `error_message` field

4. **Cost**:
   - GPT-4o-mini: ~$0.0001 per prompt
   - Mureka: Check your API plan

5. **Generated Music**: Always **instrumental BGM** (no lyrics/vocals)

## 📚 Documentation

- **Full Integration Guide**: `docs/MUREKA_INTEGRATION.md`
- **API Documentation**: See comments in source files
- **Testing Guide**: See scripts in `scripts/` folder

## 🎉 What's Working

✅ GPT-4o-mini generates contextual prompts based on user emotions  
✅ Mureka API creates instrumental BGM  
✅ Music file URLs saved to database  
✅ Complete v0/vN/vFinal flow implemented  
✅ Error handling and status tracking  
✅ Test scripts for verification  
✅ Comprehensive documentation  

## 🔜 Next Steps (Frontend TODO)

1. Add loading spinner during music generation (30-120s)
2. Display music player when `status === 'completed'`
3. Show error messages when `status === 'error'`
4. Consider WebSocket for real-time status updates
5. Add music playback UI with waveform visualization

## 📞 Support

- Mureka Docs: https://platform.mureka.ai
- Mureka Discord: https://discord.com/invite/nwu9ANqAf5
- Test scripts: `scripts/test-*.js`

---

**Integration Complete!** 🎵

The backend is fully functional. Users can now:
1. Add reading logs with emotions and quotes
2. Get AI-generated instrumental music that reflects their reading journey
3. Build a complete playlist from start to finish (v0 → vN → vFinal)
