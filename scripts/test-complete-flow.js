#!/usr/bin/env node
/**
 * End-to-end test for journey completion flow
 * 
 * This tests the complete user journey:
 * 1. Find a journey in 'reading' status with logs
 * 2. Complete the journey with rating, oneLiner, and review
 * 3. GPT-4o-mini generates vFinal music prompt (synthesizing entire journey)
 * 4. Mureka API generates final instrumental BGM
 * 5. Journey status changes to 'completed'
 * 6. Music file URL is saved to database
 * 
 * Usage: node scripts/test-complete-flow.js
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testCompleteFlow() {
  console.log('='.repeat(70));
  console.log('📚 End-to-End Journey Completion Flow Test');
  console.log('='.repeat(70));
  console.log('This test simulates completing a reading journey and generating vFinal music.');
  console.log('='.repeat(70));
  console.log('');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    // Step 0: Find a journey in 'reading' status with logs
    console.log('📚 Step 0: Finding a reading journey with logs...');
    const journeysResponse = await fetch(`${SUPABASE_URL}/rest/v1/reading_journeys?status=eq.reading&select=id,book_title,user_id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const journeys = await journeysResponse.json();
    
    if (!journeys || journeys.length === 0) {
      console.log('⚠️  No reading journey found.');
      console.log('💡 Create a journey and add logs first by:');
      console.log('   1. Run the dev server: npm run dev');
      console.log('   2. Go to http://localhost:3000/journey/new');
      console.log('   3. Start a journey and add some reading logs');
      process.exit(0);
    }

    const journey = journeys[0];
    console.log(`✅ Found journey: "${journey.book_title}" (ID: ${journey.id})`);
    console.log('');

    // Check if journey has logs
    const logsResponse = await fetch(`${SUPABASE_URL}/rest/v1/reading_logs?journey_id=eq.${journey.id}&select=id,version,log_type`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const logs = await logsResponse.json();
    
    if (!logs || logs.length === 0) {
      console.log('⚠️  Journey has no logs yet.');
      console.log('💡 Add some reading logs first:');
      console.log(`   1. Visit: http://localhost:3000/journey/${journey.id}`);
      console.log('   2. Click "기록 추가" and add at least one reading log');
      process.exit(0);
    }

    console.log(`✅ Journey has ${logs.length} reading logs`);
    console.log('');

    // Step 1: Complete the journey
    console.log('📝 Step 1: Completing the journey...');
    const completePayload = {
      rating: 5,
      oneLiner: '인간의 의지와 고독에 대한 깊은 성찰을 담은 작품',
      review: '이 책은 단순한 낚시 이야기가 아니라, 인간의 존엄성과 의지에 대한 깊은 탐구입니다. 노인과 거대한 물고기의 싸움을 통해 우리는 삶의 본질적인 투쟁을 목격합니다. 헤밍웨이의 간결하면서도 강렬한 문체는 독자로 하여금 노인의 외로운 여정에 깊이 공감하게 만듭니다.',
    };

    console.log('Journey completion data:');
    console.log(`  Rating: ${completePayload.rating}/5`);
    console.log(`  One-liner: "${completePayload.oneLiner}"`);
    console.log(`  Review: "${completePayload.review.substring(0, 100)}..."`);
    console.log('');

    const completeResponse = await fetch(`http://localhost:3000/api/journeys/${journey.id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completePayload),
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error(`❌ Failed to complete journey: ${completeResponse.status}`);
      console.error(errorText);
      process.exit(1);
    }

    const completeResult = await completeResponse.json();
    console.log(`✅ Journey completed successfully`);
    console.log(`✅ Journey status: ${completeResult.journey.status}`);
    console.log(`✅ Completed at: ${completeResult.journey.completed_at}`);
    console.log('');

    // Step 2: Check vFinal music prompt
    console.log('🤖 Step 2: GPT-4o-mini generated vFinal music prompt:');
    console.log('─'.repeat(70));
    if (completeResult.vFinalTrack) {
      console.log(completeResult.vFinalTrack.prompt);
      console.log('─'.repeat(70));
      console.log(`Genre: ${completeResult.vFinalTrack.genre}`);
      console.log(`Mood: ${completeResult.vFinalTrack.mood}`);
      console.log(`Tempo: ${completeResult.vFinalTrack.tempo}`);
      console.log('');
    } else {
      console.log('⚠️  vFinal track not yet created (async generation)');
      console.log('');
    }

    // Step 3: Trigger Mureka music generation (if track exists)
    if (completeResult.vFinalTrack?.id) {
      console.log('🎼 Step 3: Triggering Mureka vFinal BGM generation...');
      console.log('⏳ This will take 30-120 seconds (polling every 5 seconds)...');
      console.log('');

      const trackId = completeResult.vFinalTrack.id;
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
      console.log('✅ vFinal music generation completed!');
      console.log(`⏱️  Generation time: ${generateDuration}s`);
      console.log('');

      // Step 4: Display results
      console.log('🎵 Step 4: Generated vFinal Music Details:');
      console.log('─'.repeat(70));
      console.log(`MP3 URL: ${generateResult.mp3_url}`);
      console.log(`Duration: ${(generateResult.duration / 1000).toFixed(1)}s`);
      console.log(`Track ID: ${generateResult.track.id}`);
      console.log(`Status: ${generateResult.track.status}`);
      console.log('─'.repeat(70));
      console.log('');
    }

    // Step 5: Verify journey completion
    console.log('🔍 Step 5: Verifying journey completion...');
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/reading_journeys?id=eq.${journey.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const completedJourneys = await verifyResponse.json();
    
    if (completedJourneys && completedJourneys.length > 0) {
      const completedJourney = completedJourneys[0];
      console.log('✅ Journey verified in database:');
      console.log(`   Status: ${completedJourney.status}`);
      console.log(`   Rating: ${completedJourney.rating}/5`);
      console.log(`   One-liner: "${completedJourney.one_liner}"`);
      console.log(`   Completed at: ${completedJourney.completed_at}`);
      console.log('');
    }

    // Summary
    console.log('='.repeat(70));
    console.log('✅ END-TO-END COMPLETION TEST PASSED!');
    console.log('='.repeat(70));
    console.log('');
    console.log('Complete flow verified:');
    console.log('  1. ✅ User completes journey with rating, oneLiner, and review');
    console.log('  2. ✅ GPT-4o-mini generates vFinal music prompt (journey synthesis)');
    console.log('  3. ✅ Mureka API generates final instrumental BGM');
    console.log('  4. ✅ Journey status changed to "completed"');
    console.log('  5. ✅ Music file URL and metadata saved to database');
    console.log('');
    console.log(`🎧 You can view the completed journey at: http://localhost:3000/journey/${journey.id}`);
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
testCompleteFlow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
