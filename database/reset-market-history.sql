-- Clear fake seed data to force fresh API fetch
DELETE FROM market_history_candles;
-- Also clear old market prices to force fresh quote fetch
DELETE FROM market_prices;
