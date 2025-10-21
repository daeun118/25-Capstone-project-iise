#!/usr/bin/env node
/**
 * Setup script to create a test journey for music generation testing
 * 
 * This creates:
 * 1. A test user (if needed)
 * 2. A reading journey in 'reading' status
 * 3. Initial v0 music track
 * 
 * Usage: node scripts/setup-test-journey.js
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupTestJourney() {
  console.log('='.repeat(70));
  console.log('🛠️  Setting up test journey for music generation');
  console.log('='.repeat(70));
  console.log('');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    // Step 1: Find or create a test user
    console.log('👤 Step 1: Finding test user...');
    
    const usersResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const usersData = await usersResponse.json();
    
    if (!usersData.users || usersData.users.length === 0) {
      console.log('⚠️  No users found in database.');
      console.log('💡 Create a user first by:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Go to: http://localhost:3000/signup');
      console.log('   3. Create a test account');
      process.exit(0);
    }

    const testUser = usersData.users[0];
    console.log(`✅ Using user: ${testUser.email} (ID: ${testUser.id})`);
    console.log('');

    // Step 2: Create a reading journey
    console.log('📚 Step 2: Creating reading journey...');
    
    const journeyData = {
      user_id: testUser.id,
      book_title: '노인과 바다',
      book_author: '어니스트 헤밍웨이',
      book_isbn: '9788937460883',
      book_description: '쿠바의 한 노인이 84일간의 불운 끝에 거대한 물고기와 사투를 벌이는 이야기. 인간의 의지와 용기, 고독에 대한 깊은 성찰을 담은 헤밍웨이의 대표작.',
      book_cover_url: 'https://covers.openlibrary.org/b/isbn/9788937460883-L.jpg',
      book_category: '외국소설',
      book_published_date: '1952',
      status: 'reading',
    };

    const createJourneyResponse = await fetch(`${SUPABASE_URL}/rest/v1/reading_journeys`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(journeyData),
    });

    if (!createJourneyResponse.ok) {
      const errorText = await createJourneyResponse.text();
      console.error(`❌ Failed to create journey: ${createJourneyResponse.status}`);
      console.error(errorText);
      process.exit(1);
    }

    const journeys = await createJourneyResponse.json();
    const journey = journeys[0];
    
    console.log(`✅ Journey created: "${journey.book_title}"`);
    console.log(`   ID: ${journey.id}`);
    console.log('');

    // Step 3: Create v0 music track
    console.log('🎵 Step 3: Creating initial v0 music track...');
    
    const musicTrackData = {
      prompt: '쿠바 바다의 고독한 항해를 표현하는 잔잔하고 사색적인 앰비언트 음악. 바람과 파도 소리가 어우러진 듯한 분위기.',
      genre: 'ambient',
      mood: 'contemplative',
      tempo: 60,
      description: '독서 여정의 시작을 알리는 잔잔한 배경음악',
      file_url: '',
      status: 'pending',
    };

    const createTrackResponse = await fetch(`${SUPABASE_URL}/rest/v1/music_tracks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(musicTrackData),
    });

    if (!createTrackResponse.ok) {
      const errorText = await createTrackResponse.text();
      console.error(`❌ Failed to create music track: ${createTrackResponse.status}`);
      console.error(errorText);
      process.exit(1);
    }

    const tracks = await createTrackResponse.json();
    const track = tracks[0];
    
    console.log(`✅ Music track created (ID: ${track.id})`);
    console.log('');

    // Step 4: Create v0 reading log
    console.log('📝 Step 4: Creating v0 reading log...');
    
    const logData = {
      journey_id: journey.id,
      log_type: 'v0',
      version: 0,
      music_prompt: musicTrackData.prompt,
      music_track_id: track.id,
      is_public: false,
    };

    const createLogResponse = await fetch(`${SUPABASE_URL}/rest/v1/reading_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(logData),
    });

    if (!createLogResponse.ok) {
      const errorText = await createLogResponse.text();
      console.error(`❌ Failed to create reading log: ${createLogResponse.status}`);
      console.error(errorText);
      process.exit(1);
    }

    const logs = await createLogResponse.json();
    const log = logs[0];
    
    console.log(`✅ Reading log created (ID: ${log.id})`);
    console.log('');

    // Summary
    console.log('='.repeat(70));
    console.log('✅ TEST JOURNEY SETUP COMPLETE!');
    console.log('='.repeat(70));
    console.log('');
    console.log('Created resources:');
    console.log(`  User: ${testUser.email}`);
    console.log(`  Journey: "${journey.book_title}" (${journey.id})`);
    console.log(`  Music Track: ${track.id} (status: ${track.status})`);
    console.log(`  Reading Log: ${log.id} (version: v${log.version})`);
    console.log('');
    console.log('🚀 Ready to test music generation!');
    console.log('   Run: node scripts/test-music-flow.js');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('');
    console.error('❌ SETUP FAILED');
    console.error('─'.repeat(70));
    console.error(error);
    console.error('─'.repeat(70));
    process.exit(1);
  }
}

// Run setup
setupTestJourney().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
