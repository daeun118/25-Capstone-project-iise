const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testRLSAccess() {
  const testJourneyId = 'b3cd8522-ab0a-4598-9da3-61d86b85a4ed';
  
  console.log('Testing access to journey:', testJourneyId);
  console.log('(This is the journey for "파과" which has a published post)\n');

  // Test with ANON key (what the API uses)
  console.log('1️⃣ Testing with ANON key (simulating API call)...');
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: anonLogs, error: anonError } = await anonSupabase
    .from('reading_logs')
    .select('*')
    .eq('journey_id', testJourneyId);

  if (anonError) {
    console.error('❌ ANON key error:', anonError.message);
    console.log('   This means RLS is blocking access!');
  } else {
    console.log('✅ ANON key can access:', anonLogs?.length || 0, 'logs');
  }

  // Test with SERVICE_ROLE key (bypasses RLS)
  console.log('\n2️⃣ Testing with SERVICE_ROLE key (bypasses RLS)...');
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: serviceLogs, error: serviceError } = await serviceSupabase
    .from('reading_logs')
    .select('*')
    .eq('journey_id', testJourneyId);

  if (serviceError) {
    console.error('❌ SERVICE_ROLE key error:', serviceError.message);
  } else {
    console.log('✅ SERVICE_ROLE key can access:', serviceLogs?.length || 0, 'logs');
    if (serviceLogs && serviceLogs.length > 0) {
      console.log('   First log:', {
        id: serviceLogs[0].id,
        version: serviceLogs[0].version,
        log_type: serviceLogs[0].log_type,
        music_track_id: serviceLogs[0].music_track_id
      });
    }
  }

  // Check if the journey has a published post
  console.log('\n3️⃣ Checking if journey has published posts...');
  const { data: posts, error: postsError } = await anonSupabase
    .from('posts')
    .select('id, is_published')
    .eq('journey_id', testJourneyId);

  if (postsError) {
    console.error('❌ Error checking posts:', postsError.message);
  } else {
    console.log('✅ Found', posts?.length || 0, 'posts for this journey');
    posts?.forEach(post => {
      console.log('   - Post', post.id, 'is_published:', post.is_published);
    });
  }

  // Check music_tracks access
  console.log('\n4️⃣ Testing music_tracks table access with ANON key...');
  const { data: tracks, error: tracksError } = await anonSupabase
    .from('music_tracks')
    .select('id, status, file_url')
    .limit(1);

  if (tracksError) {
    console.error('❌ ANON key cannot access music_tracks:', tracksError.message);
  } else {
    console.log('✅ ANON key can access music_tracks table');
  }

  // Diagnosis
  console.log('\n📊 DIAGNOSIS:');
  if (anonError && !serviceError) {
    console.log('❌ RLS is blocking the reading_logs table for public access.');
    console.log('   The API cannot fetch music tracks for posts because it uses ANON key.');
    console.log('\n🔧 SOLUTION:');
    console.log('   Add an RLS policy to allow reading logs for journeys with published posts.');
    console.log('\n   Run this SQL in Supabase Dashboard SQL Editor:');
    console.log(`
-- Allow reading logs for journeys that have published posts
CREATE POLICY "Allow reading logs for public posts" 
ON reading_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.journey_id = reading_logs.journey_id 
    AND posts.is_published = true
  )
);`);
  } else if (!anonError && !serviceError) {
    console.log('✅ RLS is configured correctly! Both keys can access the data.');
  }
}

testRLSAccess().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});