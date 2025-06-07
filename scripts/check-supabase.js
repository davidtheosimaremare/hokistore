const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from .env.local file
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function checkSupabaseConnection() {
  console.log('🔍 Checking Supabase configuration...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment Variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing required environment variables!');
    console.log('Please check your .env.local file.');
    return;
  }

  try {
    // Test connection with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('Testing Supabase connection...');
    
    // Simple test query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('⚠️  Connection test result:', error.message);
      
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('ℹ️  The users table needs to be created.');
        console.log('Please run the SQL script in sql/setup_admin.sql in your Supabase dashboard.');
      }
    } else {
      console.log('✅ Supabase connection successful!');
    }

    // Test service role if available
    if (supabaseServiceKey) {
      console.log('\nTesting service role access...');
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Service role test failed:', authError.message);
      } else {
        console.log('✅ Service role access working!');
        console.log(`Found ${authData.users.length} users in auth.users table`);
        
        // Check if admin user exists
        const adminUser = authData.users.find(user => user.email === 'admin@gmail.com');
        if (adminUser) {
          console.log('✅ Admin user (admin@gmail.com) exists in auth.users');
        } else {
          console.log('⚠️  Admin user (admin@gmail.com) not found in auth.users');
          console.log('Run: node scripts/create-admin.js to create the admin user');
        }
      }
    }

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }

  console.log('\n📝 Next steps:');
  console.log('1. Make sure all environment variables are set in .env.local');
  console.log('2. Run the SQL script in Supabase dashboard: sql/setup_admin.sql');
  console.log('3. Create admin user: node scripts/create-admin.js');
  console.log('4. Start the development server: npm run dev');
}

checkSupabaseConnection(); 