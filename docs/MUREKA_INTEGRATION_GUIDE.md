# Mureka MCP Integration Guide

## Overview

This guide walks you through integrating Mureka AI music generation into the BookBeats platform to replace placeholder music generation with actual audio files.

## Architecture

```
User creates reading log
    ↓
MusicService.generateVNMusic()
    ↓
OpenAI GPT-4o-mini generates prompt
    ↓
Mureka MCP generates actual music (30s-2min)
    ↓
Upload to Supabase Storage
    ↓
Update music_tracks table (status: completed, file_url)
```

## Prerequisites

### 1. Mureka Account Setup

1. Visit [Mureka Platform](https://platform.mureka.ai/apiKeys)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Purchase Mureka credits (required for music generation)

### 2. Install UV Package Manager

UV is required to run the Mureka MCP server.

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Alternative:** Check [UV Installation Guide](https://github.com/astral-sh/uv)

### 3. Update .mcp.json Configuration

Add Mureka MCP server to your `.mcp.json` file:

```json
{
  "mcpServers": {
    // ... existing servers ...
    "mureka": {
      "command": "uvx",
      "args": ["mureka-mcp"],
      "env": {
        "MUREKA_API_KEY": "your_mureka_api_key_here",
        "MUREKA_API_URL": "https://api.mureka.ai",
        "TIME_OUT_SECONDS": "300"
      }
    }
  }
}
```

**Important**: Replace `your_mureka_api_key_here` with your actual API key.

### 4. Update .env.local

Add Mureka configuration to your environment variables:

```env
# Mureka Music Generation
MUREKA_API_KEY=your_mureka_api_key_here
MUREKA_API_URL=https://api.mureka.ai
MUREKA_TIMEOUT_SECONDS=300
```

## Available Mureka MCP Tools

Once configured, Claude Code will have access to 4 Mureka tools:

1. **Generate Lyrics** - Create song lyrics from prompts
2. **Generate Song** - Create complete songs with vocals
3. **Generate Background Music** - Create instrumental music
4. **Generate from Lyrics** - Create songs from existing lyrics

For BookBeats, we'll primarily use **Generate Background Music** to create instrumental tracks that match the reading mood.

## Implementation Status

### ✅ Completed
- OpenAI GPT-4o-mini music prompt generation
- Database schema for music tracks
- Service layer architecture
- Status tracking (pending/completed/error)

### 🚧 To Be Implemented
- Mureka MCP integration in MusicService
- Supabase Storage file upload
- Background job/webhook for async processing
- Status update logic
- Error handling and retry mechanism

## Testing Checklist

After implementation, verify:

- [ ] Mureka MCP server appears in Claude Desktop (4 tools available)
- [ ] API key authentication works
- [ ] Music generation succeeds (check Mureka credits usage)
- [ ] Files upload to Supabase Storage bucket
- [ ] Database updates correctly (status, file_url)
- [ ] Frontend can play generated music files
- [ ] Error states handled gracefully
- [ ] Timeout settings work correctly (5-minute limit)

## Troubleshooting

### MCP Server Not Appearing
- Verify UV is installed: `uv --version`
- Check .mcp.json syntax (valid JSON)
- Restart Claude Desktop
- Check logs for MCP initialization errors

### Authentication Failed
- Verify API key is correct
- Check Mureka credits balance
- Ensure MUREKA_API_URL is set to `https://api.mureka.ai`

### Music Generation Timeout
- Increase TIME_OUT_SECONDS in .mcp.json (max 300)
- Check network connectivity
- Verify Mureka service status

### File Upload Failed
- Verify Supabase Storage bucket exists (`music-tracks`)
- Check RLS policies allow authenticated uploads
- Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly

## Cost Estimation

- **OpenAI GPT-4o-mini**: ~$0.0001-0.0005 per prompt
- **Mureka Music Generation**: Varies by plan (check pricing at platform.mureka.ai)
- **Supabase Storage**: First 1GB free, then $0.021/GB/month

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Implement rate limiting for music generation
- Monitor credit usage to prevent overspending
- Set up alerts for low credit balance

## Next Steps

1. Complete the prerequisites above
2. Run the implementation script (to be provided)
3. Test with a single journey completion
4. Monitor logs and verify successful generation
5. Deploy to production after testing

## Support

- **Mureka**: https://platform.mureka.ai
- **MCP Documentation**: https://github.com/SkyworkAI/Mureka-mcp
- **Project Issues**: See implementation team
