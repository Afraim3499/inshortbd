export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    role: 'admin' | 'editor' | 'reader'
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    role?: 'admin' | 'editor' | 'reader'
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    role?: 'admin' | 'editor' | 'reader'
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    excerpt: string | null
                    content: Json | null
                    featured_image_url: string | null
                    status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
                    category: string
                    author_id: string | null
                    author_name: string | null
                    is_breaking: boolean | null
                    views: number | null
                    published_at: string | null
                    tags: string[] | null
                    seo_score: number | null
                    readability_score: number | null
                    meta_description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    excerpt?: string | null
                    content?: Json | null
                    featured_image_url?: string | null
                    status?: 'draft' | 'published' | 'archived'
                    category: string
                    author_id?: string | null
                    author_name?: string | null
                    is_breaking?: boolean | null
                    views?: number | null
                    published_at?: string | null
                    tags?: string[] | null
                    seo_score?: number | null
                    readability_score?: number | null
                    meta_description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    excerpt?: string | null
                    content?: Json | null
                    featured_image_url?: string | null
                    status?: 'draft' | 'published' | 'archived'
                    category?: string
                    author_id?: string | null
                    author_name?: string | null
                    is_breaking?: boolean | null
                    views?: number | null
                    published_at?: string | null
                    tags?: string[] | null
                    seo_score?: number | null
                    readability_score?: number | null
                    meta_description?: string | null
                    created_at?: string
                }
            },
            collections: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    description: string | null
                    featured_image_url: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    description?: string | null
                    featured_image_url?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    featured_image_url?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            },
            collection_posts: {
                Row: {
                    collection_id: string
                    post_id: string
                    order_index: number
                    created_at: string
                }
                Insert: {
                    collection_id: string
                    post_id: string
                    order_index: number
                    created_at?: string
                }
                Update: {
                    collection_id?: string
                    post_id?: string
                    order_index?: number
                    created_at?: string
                }
            },
            // ==== FINANCE TABLES (NEW) ====
            billionaires: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    title: string | null
                    age: number | null
                    net_worth_usd: number
                    net_worth_change_today: number | null
                    net_worth_change_ytd: number | null
                    country_code: string | null
                    industry: string
                    photo_url: string | null
                    biography: Json | null
                    source_of_wealth: string[] | null
                    world_rank: number | null
                    country_rank: number | null
                    industry_rank: number | null
                    is_self_made: boolean | null
                    age_group: string | null
                    gender: string | null
                    is_active: boolean | null
                    is_featured: boolean | null
                    views: number | null
                    meta_description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    title?: string | null
                    age?: number | null
                    net_worth_usd: number
                    net_worth_change_today?: number | null
                    net_worth_change_ytd?: number | null
                    country_code?: string | null
                    industry: string
                    photo_url?: string | null
                    biography?: Json | null
                    source_of_wealth?: string[] | null
                    world_rank?: number | null
                    country_rank?: number | null
                    industry_rank?: number | null
                    is_self_made?: boolean | null
                    age_group?: string | null
                    gender?: string | null
                    is_active?: boolean | null
                    is_featured?: boolean | null
                    views?: number | null
                    meta_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    title?: string | null
                    age?: number | null
                    net_worth_usd?: number
                    net_worth_change_today?: number | null
                    net_worth_change_ytd?: number | null
                    country_code?: string | null
                    industry?: string
                    photo_url?: string | null
                    biography?: Json | null
                    source_of_wealth?: string[] | null
                    world_rank?: number | null
                    country_rank?: number | null
                    industry_rank?: number | null
                    is_self_made?: boolean | null
                    age_group?: string | null
                    gender?: string | null
                    is_active?: boolean | null
                    is_featured?: boolean | null
                    views?: number | null
                    meta_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            companies: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    industry: string
                    founded_year: number | null
                    description: string | null
                    logo_url: string | null
                    website_url: string | null
                    stock_symbol: string | null
                    stock_price: number | null
                    market_cap_usd: number | null
                    headquarters_city: string | null
                    headquarters_country: string | null
                    is_public: boolean | null
                    status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    industry: string
                    founded_year?: number | null
                    description?: string | null
                    logo_url?: string | null
                    website_url?: string | null
                    stock_symbol?: string | null
                    stock_price?: number | null
                    market_cap_usd?: number | null
                    headquarters_city?: string | null
                    headquarters_country?: string | null
                    is_public?: boolean | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    industry?: string
                    founded_year?: number | null
                    description?: string | null
                    logo_url?: string | null
                    website_url?: string | null
                    stock_symbol?: string | null
                    stock_price?: number | null
                    market_cap_usd?: number | null
                    headquarters_city?: string | null
                    headquarters_country?: string | null
                    is_public?: boolean | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            billionaire_holdings: {
                Row: {
                    id: string
                    billionaire_id: string
                    company_id: string
                    ownership_percentage: number | null
                    shares_count: number | null
                    current_value_usd: number | null
                    holding_type: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    billionaire_id: string
                    company_id: string
                    ownership_percentage?: number | null
                    shares_count?: number | null
                    current_value_usd?: number | null
                    holding_type?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    billionaire_id?: string
                    company_id?: string
                    ownership_percentage?: number | null
                    shares_count?: number | null
                    current_value_usd?: number | null
                    holding_type?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            startup_stories: {
                Row: {
                    id: string
                    company_name: string
                    slug: string
                    story_type: string
                    founder_name: string
                    founded_year: number | null
                    region: string
                    industry: string
                    hero_image_url: string | null
                    achievement_section: Json | null
                    beginning_section: Json | null
                    struggle_section: Json | null
                    breakthrough_section: Json | null
                    current_status_section: Json | null
                    wisdom_section: Json | null
                    future_section: Json | null
                    current_valuation_usd: number | null
                    users_count: number | null
                    funding_raised_usd: number | null
                    peak_valuation_usd: number | null
                    money_lost_usd: number | null
                    is_published: boolean | null
                    is_featured: boolean | null
                    views: number | null
                    meta_description: string | null
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_name: string
                    slug: string
                    story_type: string
                    founder_name: string
                    founded_year?: number | null
                    region: string
                    industry: string
                    hero_image_url?: string | null
                    achievement_section?: Json | null
                    beginning_section?: Json | null
                    struggle_section?: Json | null
                    breakthrough_section?: Json | null
                    current_status_section?: Json | null
                    wisdom_section?: Json | null
                    future_section?: Json | null
                    current_valuation_usd?: number | null
                    users_count?: number | null
                    funding_raised_usd?: number | null
                    peak_valuation_usd?: number | null
                    money_lost_usd?: number | null
                    is_published?: boolean | null
                    is_featured?: boolean | null
                    views?: number | null
                    meta_description?: string | null
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_name?: string
                    slug?: string
                    story_type?: string
                    founder_name?: string
                    founded_year?: number | null
                    region?: string
                    industry?: string
                    hero_image_url?: string | null
                    achievement_section?: Json | null
                    beginning_section?: Json | null
                    struggle_section?: Json | null
                    breakthrough_section?: Json | null
                    current_status_section?: Json | null
                    wisdom_section?: Json | null
                    future_section?: Json | null
                    current_valuation_usd?: number | null
                    users_count?: number | null
                    funding_raised_usd?: number | null
                    peak_valuation_usd?: number | null
                    money_lost_usd?: number | null
                    is_published?: boolean | null
                    is_featured?: boolean | null
                    views?: number | null
                    meta_description?: string | null
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            pr_segments: {
                Row: {
                    id: string
                    segment_type: string
                    billionaire_id: string
                    is_sponsored: boolean | null
                    sponsor_name: string | null
                    sponsor_logo_url: string | null
                    featured_order: number | null
                    year: number | null
                    valid_from: string | null
                    valid_until: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    segment_type: string
                    billionaire_id: string
                    is_sponsored?: boolean | null
                    sponsor_name?: string | null
                    sponsor_logo_url?: string | null
                    featured_order?: number | null
                    year?: number | null
                    valid_from?: string | null
                    valid_until?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    segment_type?: string
                    billionaire_id?: string
                    is_sponsored?: boolean | null
                    sponsor_name?: string | null
                    sponsor_logo_url?: string | null
                    featured_order?: number | null
                    year?: number | null
                    valid_from?: string | null
                    valid_until?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            // ==== END FINANCE TABLES ====
            seo_analytics: {
                Row: {
                    id: string
                    post_id: string
                    seo_score: number
                    readability_score: number | null
                    word_count: number | null
                    keyword_density: number | null
                    analyzed_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    seo_score: number
                    readability_score?: number | null
                    word_count?: number | null
                    keyword_density?: number | null
                    analyzed_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    seo_score?: number
                    readability_score?: number | null
                    word_count?: number | null
                    keyword_density?: number | null
                    analyzed_at?: string
                    created_at?: string
                }
            }
            keyword_tracking: {
                Row: {
                    id: string
                    post_id: string | null
                    keyword: string
                    density: number
                    position: number | null
                    count: number
                    tracked_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id?: string | null
                    keyword: string
                    density: number
                    position?: number | null
                    count?: number
                    tracked_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string | null
                    keyword?: string
                    density?: number
                    position?: number | null
                    count?: number
                    tracked_at?: string
                    created_at?: string
                }
            }
            site_config: {
                Row: {
                    id: number
                    hero_post_id: string | null
                    pinned_post_ids: string[] | null
                    breaking_banner_active: boolean | null
                    breaking_banner_text: string | null
                }
                Insert: {
                    id?: never
                    hero_post_id?: string | null
                    pinned_post_ids?: string[] | null
                    breaking_banner_active?: boolean | null
                    breaking_banner_text?: string | null
                }
                Update: {
                    id?: never
                    hero_post_id?: string | null
                    pinned_post_ids?: string[] | null
                    breaking_banner_active?: boolean | null
                    breaking_banner_text?: string | null
                }
            }
            newsletter_subscribers: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    status: 'active' | 'unsubscribed' | 'bounced'
                    subscribed_at: string
                    unsubscribed_at: string | null
                    unsubscribe_token: string
                    source: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    status?: 'active' | 'unsubscribed' | 'bounced'
                    subscribed_at?: string
                    unsubscribed_at?: string | null
                    unsubscribe_token?: string
                    source?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    status?: 'active' | 'unsubscribed' | 'bounced'
                    subscribed_at?: string
                    unsubscribed_at?: string | null
                    unsubscribe_token?: string
                    source?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            newsletter_campaigns: {
                Row: {
                    id: string
                    subject: string
                    content: string
                    type: 'article' | 'campaign' | 'welcome'
                    post_id: string | null
                    sent_at: string | null
                    sent_count: number | null
                    opened_count: number | null
                    clicked_count: number | null
                    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
                    scheduled_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    subject: string
                    content: string
                    type: 'article' | 'campaign' | 'welcome'
                    post_id?: string | null
                    sent_at?: string | null
                    sent_count?: number | null
                    opened_count?: number | null
                    clicked_count?: number | null
                    status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
                    scheduled_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    subject?: string
                    content?: string
                    type?: 'article' | 'campaign' | 'welcome'
                    post_id?: string | null
                    sent_at?: string | null
                    sent_count?: number | null
                    opened_count?: number | null
                    clicked_count?: number | null
                    status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
                    scheduled_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            newsletter_sends: {
                Row: {
                    id: string
                    campaign_id: string
                    subscriber_id: string
                    sent_at: string
                    opened_at: string | null
                    clicked_at: string | null
                    status: 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    campaign_id: string
                    subscriber_id: string
                    sent_at?: string
                    opened_at?: string | null
                    clicked_at?: string | null
                    status?: 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    campaign_id?: string
                    subscriber_id?: string
                    sent_at?: string
                    opened_at?: string | null
                    clicked_at?: string | null
                    status?: 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed'
                    created_at?: string
                }
            }
            social_tasks: {
                Row: {
                    id: string
                    post_id: string
                    platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'other'
                    task_title: string
                    task_description: string | null
                    post_text: string | null
                    article_url: string | null
                    assigned_to: string | null
                    assigned_by: string
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    due_date: string | null
                    scheduled_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'other'
                    task_title: string
                    task_description?: string | null
                    post_text?: string | null
                    article_url?: string | null
                    assigned_to?: string | null
                    assigned_by: string
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    due_date?: string | null
                    scheduled_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    platform?: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'other'
                    task_title?: string
                    task_description?: string | null
                    post_text?: string | null
                    article_url?: string | null
                    assigned_to?: string | null
                    assigned_by?: string
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    due_date?: string | null
                    scheduled_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            social_task_completions: {
                Row: {
                    id: string
                    task_id: string
                    completed_by: string
                    completion_link: string
                    completion_notes: string | null
                    completed_at: string
                    verification_status: 'pending' | 'verified' | 'rejected'
                    verified_by: string | null
                    verified_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    completed_by: string
                    completion_link: string
                    completion_notes?: string | null
                    completed_at?: string
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    verified_by?: string | null
                    verified_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    completed_by?: string
                    completion_link?: string
                    completion_notes?: string | null
                    completed_at?: string
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    verified_by?: string | null
                    verified_at?: string | null
                    created_at?: string
                }
            }
            live_updates: {
                Row: {
                    id: string
                    content: string
                    is_active: boolean
                    created_at: string
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    content: string
                    is_active?: boolean
                    created_at?: string
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    content?: string
                    is_active?: boolean
                    created_at?: string
                    created_by?: string | null
                }
            }
            analytics_sessions: {
                Row: {
                    id: string
                    session_id: string
                    user_id: string | null
                    post_id: string
                    device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
                    browser: string | null
                    browser_version: string | null
                    os: string | null
                    os_version: string | null
                    country: string | null
                    city: string | null
                    referrer: string | null
                    traffic_source: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other' | null
                    utm_source: string | null
                    utm_medium: string | null
                    utm_campaign: string | null
                    started_at: string
                    ended_at: string | null
                    duration_seconds: number | null
                    page_views: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    session_id: string
                    user_id?: string | null
                    post_id: string
                    device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
                    browser?: string | null
                    browser_version?: string | null
                    os?: string | null
                    os_version?: string | null
                    country?: string | null
                    city?: string | null
                    referrer?: string | null
                    traffic_source?: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other' | null
                    utm_source?: string | null
                    utm_medium?: string | null
                    utm_campaign?: string | null
                    started_at?: string
                    ended_at?: string | null
                    duration_seconds?: number | null
                    page_views?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    session_id?: string
                    user_id?: string | null
                    post_id?: string
                    device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
                    browser?: string | null
                    browser_version?: string | null
                    os?: string | null
                    os_version?: string | null
                    country?: string | null
                    city?: string | null
                    referrer?: string | null
                    traffic_source?: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other' | null
                    utm_source?: string | null
                    utm_medium?: string | null
                    utm_campaign?: string | null
                    started_at?: string
                    ended_at?: string | null
                    duration_seconds?: number | null
                    page_views?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            analytics_events: {
                Row: {
                    id: string
                    session_id: string
                    post_id: string
                    event_type: 'page_view' | 'scroll' | 'time' | 'exit' | 'click'
                    event_data: Json | null
                    timestamp: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    session_id: string
                    post_id: string
                    event_type: 'page_view' | 'scroll' | 'time' | 'exit' | 'click'
                    event_data?: Json | null
                    timestamp?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    session_id?: string
                    post_id?: string
                    event_type?: 'page_view' | 'scroll' | 'time' | 'exit' | 'click'
                    event_data?: Json | null
                    timestamp?: string
                    created_at?: string
                }
            }
            media_files: {
                Row: {
                    id: string
                    file_path: string
                    file_name: string
                    mime_type: string
                    file_size: number
                    width: number | null
                    height: number | null
                    alt_text: string | null
                    caption: string | null
                    credit: string | null
                    uploaded_by: string | null
                    tags: string[] | null
                    category: string | null
                    uploaded_at: string
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    file_path: string
                    file_name: string
                    mime_type: string
                    file_size: number
                    width?: number | null
                    height?: number | null
                    alt_text?: string | null
                    caption?: string | null
                    credit?: string | null
                    uploaded_by?: string | null
                    tags?: string[] | null
                    category?: string | null
                    uploaded_at?: string
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    file_path?: string
                    file_name?: string
                    mime_type?: string
                    file_size?: number
                    width?: number | null
                    height?: number | null
                    alt_text?: string | null
                    caption?: string | null
                    credit?: string | null
                    uploaded_by?: string | null
                    tags?: string[] | null
                    category?: string | null
                    uploaded_at?: string
                    updated_at?: string
                    created_at?: string
                }
            }
            post_comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    content: string
                    parent_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    content: string
                    parent_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    content?: string
                    parent_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            post_assignments: {
                Row: {
                    id: string
                    post_id: string
                    assigned_to: string
                    assigned_by: string
                    role: 'reviewer' | 'editor' | 'approver'
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    assigned_to: string
                    assigned_by: string
                    role?: 'reviewer' | 'editor' | 'approver'
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    assigned_to?: string
                    assigned_by?: string
                    role?: 'reviewer' | 'editor' | 'approver'
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
