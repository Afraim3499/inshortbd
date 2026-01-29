
-- Insert focused Market Wire news items
INSERT INTO posts (title, slug, content, category, author_id)
VALUES 
    ('Fed Signals Potential Rate Cut as Inflation Cools', 'fed-rate-cut-signal-inflation', 'Content...', 'Economy', (SELECT id FROM authors LIMIT 1)),
    ('Bitcoin Breaks $90k Barrier Amid ETF Inflows', 'bitcoin-breaks-90k-etf', 'Content...', 'Crypto', (SELECT id FROM authors LIMIT 1)),
    ('Nvidia Earnings Beating Expectations AI Demand Soars', 'nvidia-earnings-ai-demand', 'Content...', 'Tech', (SELECT id FROM authors LIMIT 1)),
    ('Oil Prices Stabilize After Week of Volatility', 'oil-prices-stabilize-volatility', 'Content...', 'Business', (SELECT id FROM authors LIMIT 1)),
    ('European Markets Close Higher on Tech Rally', 'european-markets-tech-rally', 'Content...', 'Markets', (SELECT id FROM authors LIMIT 1)),
    ('Tesla Announces New Battery Tech breakthrough', 'tesla-battery-tech-breakthrough', 'Content...', 'Tech', (SELECT id FROM authors LIMIT 1)),
    ('USD Strengthens Against Yen Following Jobs Reports', 'usd-strengthens-yen-jobs', 'Content...', 'Forex', (SELECT id FROM authors LIMIT 1)),
    ('Global Supply Chain Pressures Ease in Q4', 'global-supply-chain-ease', 'Content...', 'Economy', (SELECT id FROM authors LIMIT 1)),
    ('Apple Unveils New Vision Pro Roadmap', 'apple-vision-pro-roadmap', 'Content...', 'Tech', (SELECT id FROM authors LIMIT 1)),
    ('Goldman Sachs Bullish on 2025 Market Outlook', 'goldman-sachs-bullish-2025', 'Content...', 'Finance', (SELECT id FROM authors LIMIT 1))
ON CONFLICT (slug) DO NOTHING;
