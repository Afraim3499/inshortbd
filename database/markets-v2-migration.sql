-- Market Dashboard V2 Migration
-- Adds support for Historical Candle Data (for Charts)

-- 1. Create MARKET HISTORY Table
CREATE TABLE IF NOT EXISTS market_history_candles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    open DECIMAL(12, 2),
    high DECIMAL(12, 2),
    low DECIMAL(12, 2),
    close DECIMAL(12, 2),
    volume BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for fast chart lookups
CREATE INDEX IF NOT EXISTS idx_market_history_symbol_time ON market_history_candles(symbol, time DESC);

-- 3. RLS Policies
ALTER TABLE market_history_candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market history is viewable by everyone" ON market_history_candles
    FOR SELECT USING (true);

-- 4. Seed Data (Mock History for S&P 500 to test charts immediately)
-- Generates 24 hourly points
INSERT INTO market_history_candles (symbol, time, open, high, low, close, volume)
SELECT 
    '^GSPC',
    NOW() - (i || ' hours')::interval,
    4750 + (random() * 50),
    4800 + (random() * 50),
    4700 + (random() * 50),
    4760 + (random() * 50),
    1000000 + (random() * 500000)::bigint
FROM generate_series(0, 24) AS i
WHERE NOT EXISTS (SELECT 1 FROM market_history_candles WHERE symbol = '^GSPC');
