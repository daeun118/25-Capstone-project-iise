const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLSFix() {
  console.log('🔧 Applying RLS fix for reading_logs table...\n');

  // The SQL to create the policy
  const sql = `
    CREATE POLICY IF NOT EXISTS "reading_logs_public_posts_select" 
    ON reading_logs 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 
        FROM posts 
        WHERE posts.journey_id = reading_logs.journey_id 
        AND posts.is_published = true
      )
    );
  `;

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // If RPC doesn't exist, we need to run this in Supabase Dashboard
      console.log('❗ Cannot execute SQL directly via client.');
      console.log('Please run the following SQL in your Supabase Dashboard SQL Editor:\n');
      console.log(sql);
      console.log('\n📍 Go to: https://supabase.com/dashboard/project/oelgskajaisratnbffip/sql');
      return;
    }

    console.log('✅ Policy created successfully!');
  } catch (err) {
    console.log('❗ Cannot execute SQL directly via client.');
    console.log('Please run the following SQL in your Supabase Dashboard SQL Editor:\n');
    console.log(sql);
    console.log('\n📍 Go to: https://supabase.com/dashboard/project/oelgskajaisratnbffip/sql');
  }

  // Test if it worked
  console.log('\n🧪 Testing access after fix...');
  
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const testJourneyId = 'b3cd8522-ab0a-4598-9da3-61d86b85a4ed';
  const { data: logs, error: logsError } = await anonSupabase
    .from('reading_logs')
    .select('*')
    .eq('journey_id', testJourneyId)
    .limit(1);

  if (logsError) {
    console.log('❌ Still cannot access with ANON key:', logsError.message);
    console.log('\nPlease run the SQL above in Supabase Dashboard to fix the issue.');
  } else {
    console.log('✅ ANON key can now access:', logs?.length || 0, 'logs');
    console.log('🎉 RLS fix successful! The playlist should now appear in feed posts.');
  }
}

applyRLSFix().then(() => {
  console.log('\n✅ Process complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});