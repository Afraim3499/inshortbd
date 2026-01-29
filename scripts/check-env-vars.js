require('dotenv').config({ path: '.env.local' });

console.log('Checking Supabase Env Vars:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
console.log('ANON:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...)' : 'Missing');
console.log('SERVICE:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
