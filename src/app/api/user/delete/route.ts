/**
 * User Account Deletion API
 * POST /api/user/delete
 *
 * Deletes user account and all associated data
 * Requires password confirmation for security
 *
 * Body: {
 *   password: string (required)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { UserService } from '@/services/user.service';
import { UserRepository } from '@/repositories/user.repository';
import { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // 1. Get user session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { password } = body;

    // 3. Validate password field
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (password.trim().length < 1) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 4. Get user email from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 5. Initialize Service Layer with admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[DeleteAccount] Missing environment variables');
      return NextResponse.json(
        { error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const adminClient = createServiceClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const userRepository = new UserRepository(adminClient);
    const userService = new UserService(userRepository, supabase, adminClient);

    // 6. Execute account deletion
    console.log(`[API] Starting account deletion for user ${user.id}`);
    const result = await userService.deleteAccount(user.id, userData.email, password);

    if (!result.success) {
      // Password verification failed or other business logic error
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // 7. Sign out user (cleanup session)
    await supabase.auth.signOut();

    console.log(`[API] Account deletion completed for user ${user.id}`);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Account deletion error:', error);

    return NextResponse.json(
      {
        error: '계정 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
