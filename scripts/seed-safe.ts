
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

const USERS = [
    { email: 'admin@inshortbd.com', password: 'admin123', role: 'admin', full_name: 'Admin User' },
    { email: 'writer@inshortbd.com', password: 'writer123', role: 'editor', full_name: 'Writer User' },
]

const DEMO_POSTS = [
    {
        title: 'প্রযুক্তি দুনিয়ার নতুন চমক: ইনশর্ট ১.০',
        slug: 'tech-world-surprise-inshort-1-0',
        category: 'Technology',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ইনশর্ট ১.০ রিলিজ হয়েছে। এটি একটি বিপ্লবী নিউজ প্ল্যাটফর্ম যা আপনাকে সর্বশেষ সংবাদ দ্রুত পৌঁছে দেবে।' }] }] },
        excerpt: 'ইনশর্ট ১.০ রিলিজ হয়েছে। এটি একটি বিপ্লবী নিউজ প্ল্যাটফর্ম।',
        status: 'published',
        tags: ['demo', 'technology', 'launch'],
        is_breaking: true,
    },
    {
        title: 'বিশ্বকাপ ক্রিকেট: বাংলাদেশের জয়ে উল্লাস',
        slug: 'world-cup-cricket-bangladesh-win',
        category: 'Sports',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'গতকাল রাতে শ্বাসরুদ্ধকর ম্যাচে বাংলাদেশ জয়লাভ করেছে।' }] }] },
        excerpt: 'গতকাল রাতে শ্বাসরুদ্ধকর ম্যাচে বাংলাদেশ জয়লাভ করেছে।',
        status: 'published',
        tags: ['demo', 'sports', 'cricket'],
        is_breaking: false,
    },
    {
        title: 'শেয়ার বাজারে বড় পতন',
        slug: 'stock-market-crash',
        category: 'Business',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'আজ শেয়ার বাজারে বড় দরপতন লক্ষ্য করা গেছে।' }] }] },
        excerpt: 'আজ শেয়ার বাজারে বড় দরপতন লক্ষ্য করা গেছে।',
        status: 'published',
        tags: ['demo', 'business', 'finance'],
        is_breaking: false,
    },
    {
        title: 'নতুন বাজেটে শিক্ষার বরাদ্দ বাড়লো',
        slug: 'new-budget-education-allocation',
        category: 'Education',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'সরকার নতুন বাজেটে শিক্ষা খাতে বরাদ্দ বাড়ানোর ঘোষণা দিয়েছে।' }] }] },
        excerpt: 'সরকার নতুন বাজেটে শিক্ষা খাতে বরাদ্দ বাড়ানোর ঘোষণা দিয়েছে।',
        status: 'published',
        tags: ['demo', 'education', 'budget'],
        is_breaking: false,
    },
    {
        title: 'হলিউড তারকা ঢাকায়',
        slug: 'hollywood-star-in-dhaka',
        category: 'Entertainment',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'জনপ্রিয় হলিউড তারকা ঢাকায় এসে ভক্তদের চমকে দিয়েছেন।' }] }] },
        excerpt: 'জনপ্রিয় হলিউড তারকা ঢাকায় এসে ভক্তদের চমকে দিয়েছেন।',
        status: 'published',
        tags: ['demo', 'entertainment', 'hollywood'],
        is_breaking: false,
    },
]

async function seed() {
    console.log('🌱 Starting Safe Seed...')

    // 1. Create Users
    for (const user of USERS) {
        console.log(`Checking user: ${user.email}`)

        // Check if exists by finding profile (since we can't easily query auth.users with service key directly without admin API wrapper complexity usually)
        // Actually using auth.admin.createUser is safest
        const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: { full_name: user.full_name },
        })

        let userId = createdUser?.user?.id

        if (createError) {
            if (createError.message.includes('already been registered')) {
                console.log(`User already exists, fetching ID...`)
                // Try to get ID via rpc or just skip if we assume profiles exist. 
                // For simplicity in this script, let's assume if registered we query the profiles table which links to auth.
                // But better: listUsers
                const { data: listData } = await supabase.auth.admin.listUsers()
                const found = listData.users.find(u => u.email === user.email)
                if (found) {
                    userId = found.id
                    console.log(`Found existing ID: ${userId}`)
                }
            } else {
                console.error(`Failed to create ${user.email}:`, createError.message)
            }
        } else {
            console.log(`Created user: ${user.email}`)
        }

        if (userId) {
            // Upsert Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role, // Important!
                })

            if (profileError) console.error(`Error updating profile for ${user.email}:`, profileError)
            else console.log(`Updated profile role for ${user.email} to ${user.role}`)
        }
    }

    // 2. Insert Content
    // We need an Author ID. Let's pick the Writer.
    const { data: users } = await supabase.auth.admin.listUsers()
    const writerUser = users.users.find(u => u.email === 'writer@inshortbd.com')

    if (!writerUser) {
        console.warn('Writer user not found, skipping posts creation.')
        return
    }

    console.log(`Using Author: ${writerUser.email} (${writerUser.id})`)

    for (const post of DEMO_POSTS) {
        const { error: insertError } = await supabase
            .from('posts')
            .upsert({
                ...post,
                author_id: writerUser.id,
                author_name: writerUser.user_metadata.full_name,
                published_at: new Date().toISOString(),
            }, { onConflict: 'slug' })

        if (insertError) console.error(`Failed to insert post "${post.title}":`, insertError.message)
        else console.log(`Inserted post: ${post.title}`)
    }

    console.log('✅ Seed Complete!')
}

seed().catch(console.error)
