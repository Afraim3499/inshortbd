-- Create Market Prices Table for Caching
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

-- RLS
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market prices are viewable by everyone" ON market_prices
    FOR SELECT USING (true);

-- Seed Data (Initial Indices Cache so the site works immediately)
INSERT INTO market_prices (symbol, name, price, change, change_percent, updated_at) VALUES
('^GSPC', 'S&P 500', 4783.45, 12.30, 0.50, NOW()),
('^DJI', 'Dow Jones', 37650.10, 85.20, 0.25, NOW()),
('^IXIC', 'NASDAQ', 15099.10, 110.40, 0.80, NOW()),
('AMD', 'AMD', 160.20, -2.10, -1.30, NOW()),
('TSLA', 'Tesla Inc', 215.30, 5.20, 2.45, NOW()),
('NVDA', 'NVIDIA Corp', 610.20, 15.50, 3.10, NOW()),
('AAPL', 'Apple Inc', 185.90, 1.20, 0.65, NOW());
