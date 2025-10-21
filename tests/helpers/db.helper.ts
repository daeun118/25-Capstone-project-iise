import { createClient } from '@supabase/supabase-js';

/**
 * 데이터베이스 직접 조작 헬퍼
 *
 * 테스트 데이터 생성, 조회, 삭제를 위한 헬퍼 함수들입니다.
 * Supabase Service Role Key를 사용하여 RLS를 우회합니다.
 *
 * ⚠️ 주의: 테스트 환경에서만 사용하세요!
 */

// Supabase 클라이언트 생성 (Service Role Key 사용)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not found in environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * 테스트 사용자 생성
 */
export async function createTestUser(
  email: string,
  password: string,
  nickname: string
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });

  if (error) throw error;
  return data.user;
}

/**
 * 테스트 사용자 삭제
 */
export async function deleteTestUser(userId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

/**
 * 특정 사용자의 모든 독서 여정 삭제
 */
export async function deleteUserJourneys(userId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('reading_journeys')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * 특정 여정 삭제
 */
export async function deleteJourney(journeyId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('reading_journeys')
    .delete()
    .eq('id', journeyId);

  if (error) throw error;
}

/**
 * 특정 사용자의 모든 게시물 삭제
 */
export async function deleteUserPosts(userId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * 테스트 독서 여정 생성
 */
export async function createTestJourney(userId: string, bookData: {
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
}) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('reading_journeys')
    .insert({
      user_id: userId,
      book_isbn: bookData.isbn,
      book_title: bookData.title,
      book_author: bookData.author,
      book_cover_url: bookData.coverUrl,
      status: 'reading',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 테스트 독서 기록 생성
 */
export async function createTestLog(
  journeyId: string,
  logData: {
    version: string;
    quote?: string;
    memo?: string;
    emotions?: string[];
  }
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('reading_logs')
    .insert({
      journey_id: journeyId,
      version: logData.version,
      quote: logData.quote,
      memo: logData.memo,
      emotions: logData.emotions,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 특정 사용자의 독서 여정 조회
 */
export async function getUserJourneys(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('reading_journeys')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

/**
 * 데이터베이스 초기화 (모든 테스트 데이터 삭제)
 * ⚠️ 위험: 테스트 환경에서만 사용!
 */
export async function cleanupAllTestData() {
  const supabase = getSupabaseClient();

  // 테스트 이메일로 시작하는 사용자만 삭제
  const { data: users } = await supabase.auth.admin.listUsers();

  if (users) {
    for (const user of users.users) {
      if (user.email?.startsWith('test') || user.email?.includes('example.com')) {
        await deleteUserJourneys(user.id);
        await deleteUserPosts(user.id);
        await deleteTestUser(user.id);
      }
    }
  }
}
