const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const REQUIRED_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'CRON_SECRET',
    'RESEND_API_KEY',
    // Integrations
    'FINNHUB_API_KEY',
    'OPEN_EXCHANGE_RATES_APP_ID',
    'UNSPLASH_ACCESS_KEY',
    'N8N_WEBHOOK_SECRET'
];

console.log('🔍 Checking Environment Variables for Deployment...\n');

let missing = [];
let present = [];

REQUIRED_VARS.forEach(key => {
    if (process.env[key] && process.env[key].length > 0) {
        if (key.includes('KEY') || key.includes('SECRET')) {
            present.push(`${key}: Present (Starts with ${process.env[key].substring(0, 3)}...)`);
        } else {
            present.push(`${key}: ${process.env[key]}`);
        }
    } else {
        missing.push(key);
    }
});

if (present.length > 0) {
    console.log('✅ PRESENT:');
    present.forEach(p => console.log('   ' + p));
}

if (missing.length > 0) {
    console.log('\n❌ MISSING (Must be added to VPS .env):');
    missing.forEach(m => console.log('   ' + m));
    process.exit(1);
} else {
    console.log('\n✨ All variables look good!');
    process.exit(0);
}
