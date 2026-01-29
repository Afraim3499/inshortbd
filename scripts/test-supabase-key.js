require('dotenv').config({ path: '.env.local' });
const https = require('https');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing URL or KEY in .env.local');
    process.exit(1);
}

console.log('Testing connection to:', url);

const req = https.request(`${url}/rest/v1/`, {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
}, (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response:', data.substring(0, 500));
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.end();
