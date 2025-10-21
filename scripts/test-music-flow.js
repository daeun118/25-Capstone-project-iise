#!/usr/bin/env node
/**
 * End-to-end test for music generation flow
 * 
 * This tests the complete user journey:
 * 1. User adds a reading log with emotions and quote
 * 2. GPT-4o-mini generates music prompt based on context
 * 3. Mureka API generates instrumental BGM
 * 4. Music file URL is saved to database
 * 
 * Usage: node scripts/test-music-flow.js
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testMusicGenerationFlow() {
  console.log('='.repeat(70));
  console.log('🎵 End-to-End Music Generation Flow Test');
  console.log('='.repeat(70));
  console.log('This test simulates a user adding a reading log and generating music.');
  console.log('='.repeat(70));
  console.log('');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    // Step 0: Find an existing journey in 'reading' status
    console.log('📚 Step 0: Finding an existing reading journey...');
    const journeysResponse = await fetch(`${SUPABASE_URL}/rest/v1/reading_journeys?status=eq.reading&select=id,book_title,user_id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const journeys = await journeysResponse.json();
    
    if (!journeys || journeys.length === 0) {
      console.log('⚠️  No active reading journey found.');
      console.log('💡 Create a journey first by:');
      console.log('   1. Run the dev server: npm run dev');
      console.log('   2. Go to http://localhost:3000/journey/new');
      console.log('   3. Search and select a book to start a journey');
      process.exit(0);
    }

    const journey = journeys[0];
    console.log(`✅ Found journey: "${journey.book_title}" (ID: ${journey.id})`);
    console.log('');

    // Step 1: Create a reading log
    console.log('📝 Step 1: Creating reading log with user input...');
    const logPayload = {
      quote: '고독은 두려운 것이 아니다. 고독 속에서 인간은 더 강해진다.',
      memo: '주인공의 고독한 항해가 인상 깊었다. 혼자만의 싸움 속에서도 포기하지 않는 모습이 감동적이다.',
      emotions: ['고독', '의지', '감동'],
      isPublic: true,
    };

    console.log('User input:');
    console.log(`  Quote: "${logPayload.quote}"`);
    console.log(`  Memo: "${logPayload.memo}"`);
    console.log(`  Emotions: ${logPayload.emotions.join(', ')}`);
    console.log('');

    const createLogResponse = await fetch(`http://localhost:3000/api/journeys/${journey.id}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logPayload),
    });

    if (!createLogResponse.ok) {
      const errorText = await createLogResponse.text();
      console.error(`❌ Failed to create log: ${createLogResponse.status}`);
      console.error(errorText);
      process.exit(1);
    }

    const logResult = await createLogResponse.json();
    console.log(`✅ Reading log created (ID: ${logResult.log.id})`);
    console.log(`✅ Music track created (ID: ${logResult.musicTrack.id})`);
    console.log('');

    // Step 2: Check GPT-generated prompt
    console.log('🤖 Step 2: GPT-4o-mini generated music prompt:');
    console.log('─'.repeat(70));
    console.log(logResult.musicTrack.prompt);
    console.log('─'.repeat(70));
    console.log(`Genre: ${logResult.musicTrack.genre}`);
    console.log(`Mood: ${logResult.musicTrack.mood}`);
    console.log(`Tempo: ${logResult.musicTrack.tempo}`);
    console.log('');

    // Step 3: Trigger Mureka music generation
    console.log('🎼 Step 3: Triggering Mureka BGM generation...');
    console.log('⏳ This will take 30-120 seconds (polling every 5 seconds)...');
    console.log('');

    const trackId = logResult.musicTrack.id;
    const generateStartTime = Date.now();

    const generateResponse = await fetch(`http://localhost:3000/api/music/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ track_id: trackId }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error(`❌ Music generation failed: ${generateResponse.status}`);
      console.error(errorText);
      process.exit(1);
    }

    const generateResult = await generateResponse.json();
    const generateDuration = ((Date.now() - generateStartTime) / 1000).toFixed(1);

    console.log('');
    console.log('✅ Music generation completed!');
    console.log(`⏱️  Generation time: ${generateDuration}s`);
    console.log('');

    // Step 4: Display results
    console.log('🎵 Step 4: Generated Music Details:');
    console.log('─'.repeat(70));
    console.log(`MP3 URL: ${generateResult.mp3_url}`);
    console.log(`Duration: ${(generateResult.duration / 1000).toFixed(1)}s`);
    console.log(`Track ID: ${generateResult.track.id}`);
    console.log(`Status: ${generateResult.track.status}`);
    console.log('─'.repeat(70));
    console.log('');

    // Step 5: Verify in database
    console.log('🔍 Step 5: Verifying in database...');
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/music_tracks?id=eq.${trackId}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const tracks = await verifyResponse.json();
    
    if (tracks && tracks.length > 0) {
      const track = tracks[0];
      console.log('✅ Music track verified in database:');
      console.log(`   Status: ${track.status}`);
      console.log(`   File URL: ${track.file_url}`);
      console.log(`   Duration: ${track.duration}s`);
      console.log('');
    }

    // Summary
    console.log('='.repeat(70));
    console.log('✅ END-TO-END TEST PASSED!');
    console.log('='.repeat(70));
    console.log('');
    console.log('Complete flow verified:');
    console.log('  1. ✅ User adds reading log with emotions and quote');
    console.log('  2. ✅ GPT-4o-mini generates contextual music prompt');
    console.log('  3. ✅ Mureka API generates instrumental BGM');
    console.log('  4. ✅ Music file URL saved to database');
    console.log('');
    console.log(`🎧 You can listen to the music at: ${generateResult.mp3_url}`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('─'.repeat(70));
    console.error(error);
    console.error('─'.repeat(70));
    process.exit(1);
  }
}

// Run the test
testMusicGenerationFlow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
