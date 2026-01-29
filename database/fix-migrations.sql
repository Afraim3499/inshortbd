-- MASTER FIX MIGRATION
-- Run this script to completely reset and fix the CMS tables.
-- WARNING: This will delete existing data in 'ads', 'playbook_strategies', and 'market_prices'.

-- 1. Enable UUID extension just in case
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean up old tables to prevent "Already Exists" errors
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS playbook_strategies CASCADE;
DROP TABLE IF EXISTS market_prices CASCADE;

-- 3. Create ADS Table
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

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public ads are viewable by everyone" ON ads FOR SELECT USING (active = true);
CREATE INDEX ads_placement_idx ON ads(placement) WHERE active = true;

INSERT INTO ads (title, image_url, target_url, placement, active) VALUES
('Premium Subscription', '/images/ads/premium-sub.jpg', '/subscribe', 'homepage_sidebar', true),
('Crypto Exchange', '/images/ads/crypto-banner.jpg', 'https://example.com/crypto', 'article_sidebar', true),
('Wealth Seminar', '/images/ads/webinar.jpg', '/finance/playbook', 'finance_banner', true);

-- 4. Create PLAYBOOK Table
CREATE TABLE playbook_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    is_locked BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE playbook_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public strategies are viewable by everyone" ON playbook_strategies FOR SELECT USING (true);

INSERT INTO playbook_strategies (order_index, title, is_locked, content, tags) VALUES
(1, 'Pay Yourself First', false, 
 '<div class="space-y-8 font-serif">
    <p class="text-2xl text-gray-700 mb-8 leading-relaxed">
        <strong>The Strategy:</strong> Automatically transfer 20% of every paycheck to investments BEFORE
        paying any bills. This "reverse budgeting" ensures wealth-building happens first.
    </p>
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 font-sans">
        <h4 class="text-xl font-black mb-4 font-display">Real Example: Maria''s Journey</h4>
        <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-gray-600">Age Started:</span><span class="font-bold">28</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Annual Salary:</span><span class="font-bold">$55,000</span></div>
            <div class="h-px bg-gray-300 my-3"></div>
            <div class="flex justify-between text-lg"><span class="font-bold text-green-700">After 10 Years:</span><span class="font-black text-2xl text-green-600">$187K</span></div>
        </div>
    </div>
 </div>',
 '[{"text": "✅ Easy", "colorClass": "bg-green-100 text-green-700"}, {"text": "🚀 High Impact", "colorClass": "bg-purple-100 text-purple-700"}]'::jsonb
),
(2, 'The 3-Income Rule', false,
 '<div class="space-y-6">
    <p class="text-2xl text-gray-700 mb-8 font-serif">
        <strong>The Strategy:</strong> Build 3 income streams - primary job, side business, passive income.
    </p>
 </div>',
 '[{"text": "⚡ Medium", "colorClass": "bg-yellow-100 text-yellow-700"}]'::jsonb
),
(3, 'Real Estate Leverage', true, null, '[]'::jsonb),
(4, 'Tax Efficiency Schema', true, null, '[]'::jsonb),
(5, 'Business Systems', true, null, '[]'::jsonb),
(6, 'Global Diversification', true, null, '[]'::jsonb),
(7, 'Legacy Planning', true, null, '[]'::jsonb);

-- 5. Create MARKET PRICES Table
CREATE TABLE market_prices (
    symbol TEXT PRIMARY KEY,
    name TEXT,
    price DECIMAL(12, 2),
    change DECIMAL(12, 2),
    change_percent DECIMAL(8, 2),
    market_cap BIGINT,
    volume BIGINT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market prices are viewable by everyone" ON market_prices FOR SELECT USING (true);

INSERT INTO market_prices (symbol, name, price, change, change_percent, updated_at) VALUES
('^GSPC', 'S&P 500', 4783.45, 12.30, 0.50, NOW()),
('^DJI', 'Dow Jones', 37650.10, 85.20, 0.25, NOW()),
('^IXIC', 'NASDAQ', 15099.10, 110.40, 0.80, NOW()),
('AMD', 'AMD', 160.20, -2.10, -1.30, NOW()),
('TSLA', 'Tesla Inc', 215.30, 5.20, 2.45, NOW()),
('NVDA', 'NVIDIA Corp', 610.20, 15.50, 3.10, NOW()),
('AAPL', 'Apple Inc', 185.90, 1.20, 0.65, NOW()),
('MSFT', 'Microsoft', 400.00, 2.50, 0.60, NOW()),
('GOOGL', 'Google', 150.00, 1.50, 1.00, NOW()),
('AMZN', 'Amazon', 170.00, 0.50, 0.30, NOW());
