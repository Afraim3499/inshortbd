require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLatestNews() {
    const { data, error } = await supabase
        .from('posts')
        .select('title, published_at, created_at')
        .order('published_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching news:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

fetchLatestNews();
