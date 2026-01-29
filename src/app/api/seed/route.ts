'use server'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

const samplePosts = [
  {
    title: 'The Future of Artificial Intelligence in Healthcare',
    slug: 'future-ai-healthcare',
    excerpt: 'How machine learning is revolutionizing patient care and medical diagnosis, transforming the healthcare industry as we know it.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Artificial intelligence is transforming healthcare in unprecedented ways. From diagnostic tools to personalized treatment plans, AI is helping doctors make better decisions faster.' }]
        }
      ]
    }),
    category: 'Tech',
    status: 'published',
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200',
  },
  {
    title: 'Global Climate Summit Reaches Historic Agreement',
    slug: 'climate-summit-agreement',
    excerpt: 'World leaders commit to ambitious carbon reduction targets in landmark environmental accord.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'In a historic move, nations around the world have agreed to unprecedented climate action targets that could reshape global energy policy for decades to come.' }]
        }
      ]
    }),
    category: 'World',
    status: 'published',
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200',
  },
  {
    title: 'Tech Giants Face New Regulatory Scrutiny',
    slug: 'tech-giants-regulation',
    excerpt: 'Major technology companies are under increased pressure as governments worldwide implement stricter data privacy and antitrust measures.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The regulatory landscape for big tech is shifting rapidly as lawmakers seek to balance innovation with consumer protection and market competition.' }]
        }
      ]
    }),
    category: 'Tech',
    status: 'published',
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
  },
  {
    title: 'Election Results Reshape Political Landscape',
    slug: 'election-results-reshape',
    excerpt: 'Voters deliver a decisive mandate in what analysts are calling a transformative election cycle.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The election results have sent shockwaves through the political establishment, with new coalitions forming and traditional alliances being tested.' }]
        }
      ]
    }),
    category: 'Politics',
    status: 'published',
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200',
  },
  {
    title: 'Cultural Renaissance in Digital Art',
    slug: 'cultural-renaissance-digital-art',
    excerpt: 'NFTs and digital galleries are redefining how we experience and value contemporary art.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The art world is experiencing a digital transformation, with new platforms and technologies creating unprecedented opportunities for artists and collectors alike.' }]
        }
      ]
    }),
    category: 'Culture',
    status: 'published',
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200',
  },
  {
    title: 'Stock Market Reaches All-Time High',
    slug: 'stock-market-all-time-high',
    excerpt: 'Investor confidence drives major indices to record-breaking levels amid strong economic indicators.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The stock market surge reflects growing optimism about economic recovery and corporate earnings, though some analysts warn of potential volatility ahead.' }]
        }
      ]
    }),
    category: 'Business',
    status: 'published',
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
  },
  {
    title: 'Revolutionary Quantum Computing Breakthrough',
    slug: 'quantum-computing-breakthrough',
    excerpt: 'Scientists achieve quantum supremacy milestone that could accelerate drug discovery and cryptography.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The breakthrough represents a significant step forward in quantum computing capabilities, opening new possibilities for solving complex problems that were previously intractable.' }]
        }
      ]
    }),
    category: 'Tech',
    status: 'published',
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200',
  },
  {
    title: 'International Trade Agreement Signed',
    slug: 'international-trade-agreement',
    excerpt: 'Major economies finalize comprehensive trade pact expected to boost global commerce.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The agreement removes barriers and establishes new frameworks for international cooperation, potentially reshaping global supply chains.' }]
        }
      ]
    }),
    category: 'World',
    status: 'published',
    published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  },
  {
    title: 'New Policy Framework for Education Reform',
    slug: 'education-reform-policy',
    excerpt: 'Comprehensive education legislation aims to address learning gaps and modernize curriculum.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The new framework introduces significant changes to how schools operate, with emphasis on digital literacy and personalized learning approaches.' }]
        }
      ]
    }),
    category: 'Politics',
    status: 'published',
    published_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200',
  },
  {
    title: 'Sustainable Fashion Takes Center Stage',
    slug: 'sustainable-fashion-center-stage',
    excerpt: 'Designers and brands commit to eco-friendly practices as consumer demand for sustainability grows.',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'The fashion industry is undergoing a green transformation, with major brands investing in sustainable materials and circular economy models.' }]
        }
      ]
    }),
    category: 'Culture',
    status: 'published',
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    featured_image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  },
]

export async function GET() {
  try {
    // Check if we have valid Supabase credentials BEFORE creating client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey || supabaseUrl === '' || serviceRoleKey === '') {
      return NextResponse.json(
        { 
          error: 'Missing Supabase credentials', 
          message: 'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file',
          hint: 'The seed endpoint requires the service role key (not anon key) to bypass RLS policies and insert data.',
          currentEnv: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!serviceRoleKey,
            urlLength: supabaseUrl?.length || 0,
            keyLength: serviceRoleKey?.length || 0,
            nodeEnv: process.env.NODE_ENV,
          },
          troubleshooting: [
            '1. Verify .env.local exists in the project root',
            '2. Ensure SUPABASE_SERVICE_ROLE_KEY is set (not just anon key)',
            '3. Restart the dev server after adding env vars',
            '4. Service role key bypasses RLS - required for seeding'
          ]
        },
        { status: 500 }
      )
    }

    // Use service role key to bypass RLS policies for seeding
    // This is safe because this endpoint should only be used in development
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get or create a default author (you may need to adjust this based on your auth setup)
    const { data: users } = await (supabase.from('profiles') as any).select('id').limit(1)
    const authorId = users && users.length > 0 ? users[0].id : null

    // Insert sample posts
    const postsToInsert = samplePosts.map(post => ({
      ...post,
      author_id: authorId,
      views: Math.floor(Math.random() * 10000),
    }))

    const { data: insertedPosts, error: insertError } = await (supabase
      .from('posts') as any)
      .insert(postsToInsert)
      .select('id, title')

    if (insertError) {
      console.error('Error inserting posts:', insertError)
      return NextResponse.json({ error: 'Failed to seed posts', details: insertError }, { status: 500 })
    }

    // Create or update site_config
    const { data: existingConfig } = await (supabase
      .from('site_config') as any)
      .select('id')
      .single()

    const configData = {
      hero_post_id: insertedPosts && insertedPosts.length > 0 ? insertedPosts[0].id : null,
      pinned_post_ids: insertedPosts && insertedPosts.length >= 3 
        ? [insertedPosts[1].id, insertedPosts[2].id] 
        : [],
      breaking_banner_active: false,
      breaking_banner_text: null,
    }

    if (existingConfig) {
      await (supabase
        .from('site_config') as any)
        .update(configData)
        .eq('id', existingConfig.id)
    } else {
      await (supabase
        .from('site_config') as any)
        .insert(configData)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedPosts?.length || 0} posts`,
      posts: insertedPosts,
    })
  } catch (error) {
    console.error('Error in seed endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
