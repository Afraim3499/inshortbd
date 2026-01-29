-- Create Ads Table
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    placement TEXT NOT NULL CHECK (placement IN ('homepage_sidebar', 'article_sidebar', 'article_inline', 'finance_banner')),
    active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active ads
CREATE POLICY "Public ads are viewable by everyone" ON ads
    FOR SELECT USING (active = true);

-- Indexes for performance
CREATE INDEX ads_placement_idx ON ads(placement) WHERE active = true;

-- Seed Data (Example Ads)
INSERT INTO ads (title, image_url, target_url, placement, active) VALUES
('Premium Subscription', '/images/ads/premium-sub.jpg', '/subscribe', 'homepage_sidebar', true),
('Crypto Exchange', '/images/ads/crypto-banner.jpg', 'https://example.com/crypto', 'article_sidebar', true),
('Wealth Seminar', '/images/ads/webinar.jpg', '/finance/playbook', 'finance_banner', true);
