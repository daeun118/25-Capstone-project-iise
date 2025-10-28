const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJourneyMusic() {
  const journeyId = 'b3cd8522-ab0a-4598-9da3-61d86b85a4ed';
  
  console.log('Checking journey:', journeyId);
  
  // Get journey details
  const { data: journey } = await supabase
    .from('reading_journeys')
    .select('*')
    .eq('id', journeyId)
    .single();
  
  console.log('Journey:', journey?.book_title, '(ID:', journey?.id, ')');
  
  // Get logs for this journey
  const { data: logs } = await supabase
    .from('reading_logs')
    .select(`
      id,
      version,
      log_type,
      music_track_id,
      music_tracks (
        id,
        file_url,
        status,
        genre,
        mood
      )
    `)
    .eq('journey_id', journeyId)
    .order('version');
  
  console.log('\nLogs found:', logs?.length || 0);
  
  if (logs) {
    logs.forEach(log => {
      console.log(`\nLog v${log.version} (${log.log_type}):`);
      console.log('  - music_track_id:', log.music_track_id);
      console.log('  - music_tracks:', log.music_tracks);
    });
  }
  
  // Now check with the same query as API (with .not filter)
  console.log('\n--- With API filter (.not music_track_id is null) ---');
  const { data: apiLogs } = await supabase
    .from('reading_logs')
    .select(`
      id,
      version,
      log_type,
      music_track_id,
      music_tracks (
        id,
        file_url,
        status,
        genre,
        mood
      )
    `)
    .eq('journey_id', journeyId)
    .not('music_track_id', 'is', null)
    .order('version');
  
  console.log('API query logs found:', apiLogs?.length || 0);
  
  if (apiLogs) {
    apiLogs.forEach(log => {
      console.log(`\nAPI Log v${log.version}:`);
      console.log('  - Has music_tracks data:', !!log.music_tracks);
      console.log('  - File URL:', log.music_tracks?.file_url ? '✓' : '✗');
    });
  }
}

checkJourneyMusic().then(() => {
  console.log('\n✅ 검사 완료');
  process.exit(0);
}).catch(error => {
  console.error('❌ 오류:', error);
  process.exit(1);
});