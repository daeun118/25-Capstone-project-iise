# Mureka Music Generation Integration

## Overview

This document describes the complete integration of Mureka AI music generation into the Reading Experience Platform. The integration enables automatic BGM (Background Music) generation based on user's reading journey.

## Architecture

### Complete Flow

```
User adds reading log
    ↓
GPT-4o-mini generates music prompt (based on book context + user emotions)
    ↓
Mureka API generates instrumental BGM
    ↓
Music file URL saved to database
    ↓
User can play generated music
```

### Key Components

1. **GPT Prompt Generation** (`src/lib/openai/client.ts`)
   - Model: `gpt-4o-mini`
   - Temperature: `0.8` (creative)
   - Response Format: JSON
   - Context: Book info + previous logs (last 2) + user input

2. **Mureka Service** (`src/services/mureka.service.ts`)
   - Submit music generation request
   - Poll for completion (40 attempts × 5s = 200s max)
   - Return MP3 URL when ready

3. **Music Generation API** (`src/app/api/music/generate/route.ts`)
   - Integrates GPT + Mureka
   - Updates database with music file URL
   - Handles errors gracefully

4. **Music Service** (`src/services/music.service.ts`)
   - Orchestrates v0, vN, vFinal music generation
   - Creates music_tracks with 'pending' status
   - Delegates actual generation to API endpoint

## API Endpoints

### POST /api/journeys/[id]/logs

Creates a reading log and triggers music generation.

**Request:**
```json
{
  "quote": "인상 깊은 구절",
  "memo": "독서 기록 메모",
  "emotions": ["고독", "의지", "감동"],
  "isPublic": true
}
```

**Response:**
```json
{
  "log": {
    "id": "uuid",
    "version": 1,
    "quote": "...",
    "memo": "...",
    "emotions": ["고독", "의지", "감동"],
    "music_track": {
      "id": "uuid",
      "prompt": "GPT-generated prompt",
      "genre": "ambient",
      "mood": "contemplative",
      "tempo": 60,
      "status": "pending"
    }
  },
  "musicTrack": { /* same as music_track above */ },
  "message": "Reading log created successfully"
}
```

### POST /api/music/generate

Generates actual music using Mureka API.

**Request:**
```json
{
  "track_id": "uuid"
}
```

**Response (Success):**
```json
{
  "success": true,
  "track": {
    "id": "uuid",
    "status": "completed",
    "file_url": "https://api.mureka.ai/...",
    "duration": 180,
    "mureka_task_id": "101389095141377"
  },
  "message": "음악 생성이 완료되었습니다.",
  "mp3_url": "https://api.mureka.ai/...",
  "duration": 180000
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "음악 생성에 실패했습니다.",
  "message": "Detailed error message"
}
```

## Music Generation Strategies

### v0 Music (Journey Start)
- **Input**: Book metadata only (title, description, category)
- **Prompt Style**: Anticipatory, contemplative
- **Example**: "쿠바 바다의 고독한 항해를 표현하는 잔잔하고 사색적인 앰비언트 음악"

### vN Music (During Reading)
- **Input**: Previous logs (last 2) + current user input (quote, emotions, memo)
- **Prompt Style**: Reflects current moment while maintaining journey continuity
- **Context**: Cumulative emotional journey
- **Example**: "고독과 의지가 교차하는 순간을 표현하는 음악. 파도처럼 밀려오는 감정의 물결..."

### vFinal Music (Completion)
- **Input**: All previous logs + final review
- **Prompt Style**: Synthesizing, conclusive, brings closure
- **Example**: "전체 독서 여정을 종합한 피날레 음악. 시작부터 끝까지의 감정적 여정을 하나로..."

## Environment Variables

Required in `.env.local`:

```env
# OpenAI (for prompt generation)
OPENAI_API_KEY=sk-proj-...

# Mureka (for music generation)
MUREKA_API_KEY=op_mgxw709q8WwRLVaLiySHMRU2PSWAkT7
MUREKA_API_URL=https://api.mureka.ai

# Supabase (database)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## MCP Configuration

The Mureka MCP server is configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "mureka": {
      "command": "uvx",
      "args": ["mureka-mcp"],
      "env": {
        "MUREKA_API_KEY": "op_mgxw709q8WwRLVaLiySHMRU2PSWAkT7",
        "MUREKA_API_URL": "https://api.mureka.ai",
        "TIME_OUT_SECONDS": "500"
      }
    }
  }
}
```

## Database Schema

### music_tracks Table

```sql
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT NOT NULL,           -- GPT-generated music prompt
  genre TEXT,                      -- ambient, classical, etc.
  mood TEXT,                       -- contemplative, energetic, etc.
  tempo INTEGER,                   -- BPM
  file_url TEXT NOT NULL,          -- Mureka MP3 URL (empty until generated)
  file_size INTEGER,
  duration INTEGER,                -- Duration in seconds
  description TEXT,
  mureka_task_id VARCHAR,          -- Mureka API task ID
  status VARCHAR,                  -- pending, generating, completed, error
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### reading_logs Table

Links to music_tracks:

```sql
CREATE TABLE reading_logs (
  id UUID PRIMARY KEY,
  journey_id UUID NOT NULL,
  log_type VARCHAR NOT NULL,       -- v0, vN, vFinal
  version INTEGER NOT NULL,
  quote TEXT,
  memo TEXT,
  music_prompt TEXT,
  music_track_id UUID REFERENCES music_tracks(id),
  is_public BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### Manual Test Scripts

1. **Test Mureka API directly:**
   ```bash
   node scripts/test-mureka-api.js
   ```

2. **Setup test journey:**
   ```bash
   node scripts/setup-test-journey.js
   ```

3. **Test end-to-end flow:**
   ```bash
   node scripts/test-music-flow.js
   ```

### Expected Timing

- GPT Prompt Generation: 1-3 seconds
- Mureka Music Generation: 30-120 seconds
- Total: 31-123 seconds per music track

## Error Handling

### Common Errors

1. **OpenAI API Error**
   - Status: 500
   - Message: "GPT prompt generation failed"
   - Resolution: Check OPENAI_API_KEY

2. **Mureka API Error**
   - Status: 500
   - Message: "음악 생성에 실패했습니다"
   - Resolution: Check MUREKA_API_KEY and API limits

3. **Database Error**
   - Status: 500
   - Message: "음악 트랙 업데이트에 실패했습니다"
   - Resolution: Check Supabase connection

### Error States in Database

```typescript
// music_tracks.status values
'pending'     // Initial state after GPT prompt generation
'generating'  // Mureka API is processing
'completed'   // Music successfully generated
'error'       // Generation failed (see error_message field)
```

## Frontend Integration (TODO)

The frontend should:

1. **After creating a reading log:**
   ```typescript
   // Response includes musicTrack with status 'pending'
   const response = await fetch(`/api/journeys/${id}/logs`, {
     method: 'POST',
     body: JSON.stringify({ quote, memo, emotions })
   });
   const { log, musicTrack } = await response.json();
   
   // Immediately trigger music generation
   if (musicTrack.status === 'pending') {
     triggerMusicGeneration(musicTrack.id);
   }
   ```

2. **Trigger music generation:**
   ```typescript
   async function triggerMusicGeneration(trackId: string) {
     try {
       const response = await fetch('/api/music/generate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ track_id: trackId })
       });
       
       const result = await response.json();
       
       if (result.success) {
         console.log('Music generated:', result.mp3_url);
         // Update UI with music player
       } else {
         console.error('Music generation failed:', result.error);
       }
     } catch (error) {
       console.error('Failed to generate music:', error);
     }
   }
   ```

3. **Show generation status:**
   ```typescript
   // Display loading state while status is 'generating'
   // Show music player when status is 'completed'
   // Show error message when status is 'error'
   ```

## Performance Considerations

1. **Prompt Generation (GPT-4o-mini)**
   - Token efficiency: Only use last 2 logs for context
   - Cost: ~$0.0001 per request
   - Speed: 1-3 seconds

2. **Music Generation (Mureka)**
   - Polling interval: 5 seconds
   - Max attempts: 40 (200 seconds total)
   - Typical duration: 60-120 seconds

3. **Database**
   - music_tracks are created immediately with 'pending' status
   - file_url is updated after Mureka completes
   - No blocking during generation

## Security

1. **API Keys**
   - OPENAI_API_KEY: Server-side only
   - MUREKA_API_KEY: Server-side only
   - Never expose in client code

2. **Row Level Security**
   - Users can only access their own reading_journeys
   - music_tracks inherit permissions through reading_logs

3. **Rate Limiting**
   - Consider adding rate limits for music generation
   - Mureka API has built-in limits

## Monitoring

### Logs to Monitor

```typescript
// Service logs
[MusicService] Music track ${trackId} created with pending status
[Music Generation] Starting for track: ${trackId}
[Music Generation] Prompt: ${prompt}
[Music Generation] Success: ${mp3Url}

// Mureka polling logs
[Mureka] Attempt ${attempt}/${maxAttempts} - Status: ${status}
[Mureka] Task submitted: ${taskId} (trace: ${traceId})
[Mureka] BGM generated successfully: ${mp3Url}
```

### Metrics to Track

- Music generation success rate
- Average generation time
- GPT prompt generation time
- Mureka API response time
- Error rates by type

## Future Improvements

1. **Async Processing**
   - Use background jobs (e.g., BullMQ) instead of polling
   - Implement webhooks for Mureka completion

2. **Caching**
   - Cache GPT prompts for similar contexts
   - Store generated music metadata

3. **Optimization**
   - Batch music generation for multiple logs
   - Parallel processing for v0 + vN

4. **User Experience**
   - Real-time progress updates via WebSocket
   - Preview mode with sample music
   - Music customization options (genre, mood preferences)

## Troubleshooting

### Music not generating

1. Check environment variables:
   ```bash
   echo $OPENAI_API_KEY
   echo $MUREKA_API_KEY
   ```

2. Check database status:
   ```sql
   SELECT id, status, error_message FROM music_tracks 
   WHERE status = 'error' ORDER BY created_at DESC LIMIT 5;
   ```

3. Check API logs:
   ```bash
   npm run dev
   # Look for [Music Generation] logs
   ```

4. Test Mureka API directly:
   ```bash
   node scripts/test-mureka-api.js
   ```

### Slow generation

- Mureka typically takes 60-120 seconds
- If > 200 seconds, check Mureka API status
- Consider increasing `maxAttempts` in `mureka.service.ts`

### Database errors

- Verify Supabase connection
- Check RLS policies on music_tracks table
- Ensure user has permissions

## Contact & Support

- Mureka Documentation: https://platform.mureka.ai
- Mureka Discord: https://discord.com/invite/nwu9ANqAf5
- OpenAI API: https://platform.openai.com/docs

## Version History

- **v1.0.0** (2025-10-21): Initial integration
  - GPT-4o-mini for prompt generation
  - Mureka API for BGM generation
  - Complete v0, vN, vFinal flow
  - Test scripts and documentation
