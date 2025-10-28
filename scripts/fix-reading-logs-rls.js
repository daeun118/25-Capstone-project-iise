const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixReadingLogsRLS() {
  console.log('🔍 Checking current RLS policies for reading_logs table...\n');

  // Check current policies
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'reading_logs');

  if (policiesError) {
    console.error('Error fetching policies:', policiesError);
    return;
  }

  console.log('Current policies:', policies?.map(p => p.policyname) || []);

  // Test with ANON key
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Test query with journey_id
  const testJourneyId = 'b3cd8522-ab0a-4598-9da3-61d86b85a4ed';
  
  console.log('\n🧪 Testing with ANON key (simulating API call)...');
  const { data: anonLogs, error: anonError } = await anonSupabase
    .from('reading_logs')
    .select('*')
    .eq('journey_id', testJourneyId)
    .limit(1);

  if (anonError) {
    console.error('❌ ANON key error:', anonError.message);
  } else {
    console.log('✅ ANON key can access:', anonLogs?.length || 0, 'logs');
  }

  console.log('\n🧪 Testing with SERVICE_ROLE key...');
  const { data: serviceLogs, error: serviceError } = await supabase
    .from('reading_logs')
    .select('*')
    .eq('journey_id', testJourneyId)
    .limit(1);

  if (serviceError) {
    console.error('❌ SERVICE_ROLE key error:', serviceError.message);
  } else {
    console.log('✅ SERVICE_ROLE key can access:', serviceLogs?.length || 0, 'logs');
  }

  // If ANON can't access but SERVICE_ROLE can, we need to add a policy
  if (anonError && !serviceError) {
    console.log('\n🔧 RLS is blocking public access. Need to add a policy for public posts.');
    console.log('\nSuggested SQL to run in Supabase Dashboard:');
    console.log(`
-- Allow reading logs for journeys that have published posts
CREATE POLICY "Allow reading logs for public posts" 
ON reading_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.journey_id = reading_logs.journey_id 
    AND posts.is_published = true
  )
);
    `);
  }
}

fixReadingLogsRLS().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});