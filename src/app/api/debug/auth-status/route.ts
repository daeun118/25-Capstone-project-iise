import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  return Response.json({
    hasSession: !!session,
    sessionError: sessionError?.message,
    user: user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      confirmed_at: user.confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
    } : null,
    userError: userError?.message,
  });
}
