const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMusicTracks() {
  // Get test user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('nickname', '테스트계정')
    .single();

  if (!user) {
    console.log('테스트계정 사용자를 찾을 수 없습니다.');
    return;
  }

  console.log('테스트계정 ID:', user.id);

  // Get journeys for test user
  const { data: journeys } = await supabase
    .from('reading_journeys')
    .select('id, book_title, status')
    .eq('user_id', user.id);

  console.log('\n테스트계정의 독서 여정:', journeys?.length || 0, '개');

  for (const journey of (journeys || [])) {
    console.log(`\n[${journey.book_title}] (상태: ${journey.status})`);
    
    // Get logs with music tracks
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
          prompt,
          genre,
          mood,
          status
        )
      `)
      .eq('journey_id', journey.id)
      .order('version');

    if (logs && logs.length > 0) {
      logs.forEach(log => {
        const hasMusic = log.music_track_id && log.music_tracks;
        console.log(`  - v${log.version} (${log.log_type}): ${hasMusic ? '🎵 음악 있음' : '❌ 음악 없음'}`);
        if (hasMusic) {
          console.log(`    → 상태: ${log.music_tracks.status}`);
          console.log(`    → URL: ${log.music_tracks.file_url ? '✓' : '✗'}`);
          console.log(`    → 장르: ${log.music_tracks.genre || 'N/A'}`);
        }
      });
    } else {
      console.log('  로그 없음');
    }

    // Check if journey has a post
    const { data: posts } = await supabase
      .from('posts')
      .select('id, is_published')
      .eq('journey_id', journey.id);

    if (posts && posts.length > 0) {
      console.log(`  📝 게시물: ${posts.length}개 (공개: ${posts.filter(p => p.is_published).length}개)`);
    }
  }
}

checkMusicTracks().then(() => {
  console.log('\n✅ 검사 완료');
  process.exit(0);
}).catch(error => {
  console.error('❌ 오류:', error);
  process.exit(1);
});