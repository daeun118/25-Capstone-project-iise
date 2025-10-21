# Journey Detail Page Implementation

## File: src/app/(main)/journey/[id]/page.tsx

This page displays the journey details with music player, playlist, and actions.

### Complete Implementation

See the attached file for the full implementation that includes:

1. **State Management**:
   - journey: Current journey data
   - logs: Reading logs with music tracks
   - currentTrack: Currently playing track
   - isLoading: Loading state
   - isGeneratingMusic: Music generation status

2. **Key Features**:
   - Fetch journey data (currently mocked)
   - Display journey header with book info
   - Music player with current track
   - Playlist of all generated music
   - Music generation status tracking
   - Polling for music generation completion
   - Statistics display
   - Action buttons (add log, complete journey)

3. **Components Used**:
   - JourneyHeader
   - MusicPlayer
   - Playlist
   - MusicGenerationStatus
   - LoadingSpinner

4. **API Integration Points** (to be implemented):
   - GET /api/journeys/[id] - Fetch journey details
   - POST /api/music/generate - Start music generation
   - GET /api/music/generate?track_id={id} - Check music status

### Usage Flow:
1. User navigates to /journey/[id]
2. Page fetches journey and logs
3. If music is pending, starts generation
4. Polls for completion every 5 seconds
5. Shows music player when track is ready
6. User can add more logs or complete journey

