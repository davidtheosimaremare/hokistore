const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xxedaynwrzqojlrpqzdz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'
);

async function checkTables() {
  console.log('Checking database tables...');
  
  const tables = ['user_addresses', 'orders', 'order_items', 'profiles'];
  
  for (const table of tables) {
    try {
      console.log(`\n${table}:`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${error.message}`);
      } else {
        console.log(`✅ Table exists`);
        if (data && data.length > 0) {
          console.log(`📊 Has data: ${data.length} sample records`);
        } else {
          console.log(`📊 Table is empty`);
        }
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }
  
  // Check current user session
  console.log('\n=== AUTH STATUS ===');
  try {
    const { data: session } = await supabase.auth.getSession();
    console.log('Session exists:', !!session.session);
    console.log('User ID:', session.session?.user?.id || 'None');
    console.log('User email:', session.session?.user?.email || 'None');
  } catch (err) {
    console.log('Auth error:', err.message);
  }
}

checkTables(); 