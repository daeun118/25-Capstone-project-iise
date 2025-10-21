#!/usr/bin/env node
/**
 * Test Mureka API directly
 * 
 * This script tests the real Mureka API endpoint
 * Usage: node scripts/test-mureka-api.js
 */

require('dotenv').config({ path: '.env.local' });

const MUREKA_API_KEY = process.env.MUREKA_API_KEY;
const MUREKA_API_URL = process.env.MUREKA_API_URL || 'https://api.mureka.ai';

async function testMurekaAPI() {
  console.log('='.repeat(60));
  console.log('🎵 Testing Mureka API');
  console.log('='.repeat(60));
  console.log('API URL:', MUREKA_API_URL);
  console.log('API Key:', MUREKA_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('='.repeat(60));

  if (!MUREKA_API_KEY) {
    console.error('❌ MUREKA_API_KEY not set in .env.local');
    process.exit(1);
  }

  // Try different payload variations
  const payloads = [
    // Variation 1: Simple lyrics only
    {
      lyrics: 'instrumental music for reading'
    },
    // Variation 2: With prompt
    {
      prompt: 'Create ambient instrumental music',
      lyrics: 'instrumental'
    },
    // Variation 3: With title
    {
      title: 'Reading Music',
      lyrics: 'instrumental background music'
    },
    // Variation 4: Different format
    {
      text: 'Create instrumental background music for reading',
      style: 'ambient'
    }
  ];
  
  const payload = payloads[0]; // Try first variation

  console.log('\n📤 Request to /v1/song/generate:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n⏳ Sending request...\n');

  try {
    const response = await fetch(`${MUREKA_API_URL}/v1/song/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MUREKA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('\n📄 Raw Response:');
    console.log(responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ Parsed Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.songs && data.songs.length > 0) {
          console.log('\n🎵 Generated Songs:');
          data.songs.forEach((song, index) => {
            console.log(`\nSong ${index + 1}:`);
            console.log(`  Title: ${song.title}`);
            console.log(`  Duration: ${(song.duration_milliseconds / 1000).toFixed(1)}s`);
            console.log(`  MP3 URL: ${song.mp3_url}`);
            console.log(`  Genres: ${song.genres?.join(', ')}`);
            console.log(`  Moods: ${song.moods?.join(', ')}`);
          });
        } else if (data.feed_id) {
          console.log('\n⏳ Async generation started:');
          console.log(`  Feed ID: ${data.feed_id}`);
          console.log('  Status: Generation in progress (poll for results)');
        }
      } catch (parseError) {
        console.error('\n❌ Failed to parse JSON response');
      }
    } else {
      console.error('\n❌ API Request Failed');
      
      // Try different endpoints if this one fails
      console.log('\n🔄 Trying alternative endpoints...');
      
      const alternativeEndpoints = [
        '/api/v1/song/generate',
        '/v1/music/create',
        '/api/music/generate'
      ];

      for (const endpoint of alternativeEndpoints) {
        console.log(`\n  Testing ${endpoint}...`);
        try {
          const altResponse = await fetch(`${MUREKA_API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MUREKA_API_KEY}`,
            },
            body: JSON.stringify(payload),
          });
          
          console.log(`    Status: ${altResponse.status}`);
          
          if (altResponse.ok) {
            console.log(`    ✅ This endpoint works!`);
            const altData = await altResponse.text();
            console.log(`    Response: ${altData.substring(0, 100)}...`);
            break;
          }
        } catch (err) {
          console.log(`    ❌ Failed: ${err.message}`);
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
    console.error(error.stack);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test completed');
  console.log('='.repeat(60));
}

// Run the test
testMurekaAPI().catch(console.error);