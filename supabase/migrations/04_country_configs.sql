-- Country reference data: international dial code + currency per country
-- VAGIN operates in. Drives phone-number normalization/validation (dashboard
-- + WhatsApp bot) and currency-aware bot messages. country must match the
-- exact strings offered in the School form's country dropdown.
-- paid_pad_price is a per-country monetary amount, not just a symbol swap —
-- 200 Naira and 200 Malawian Kwacha are very different real prices. Only
-- Nigeria's is known right now; other countries stay NULL (bot falls back to
-- 200 and logs a warning) until a real local price is set here.
CREATE TABLE IF NOT EXISTS country_configs (
  country TEXT PRIMARY KEY,
  dial_code TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  paid_pad_price NUMERIC
);

INSERT INTO country_configs (country, dial_code, currency_code, currency_symbol, paid_pad_price) VALUES
  ('Nigeria', '234', 'NGN', '₦', 200),
  ('Malawi',  '265', 'MWK', 'MK', NULL),
  ('Ghana',   '233', 'GHS', 'GH₵', NULL),
  ('Kenya',   '254', 'KES', 'KSh', NULL)
ON CONFLICT (country) DO UPDATE SET
  dial_code = EXCLUDED.dial_code,
  currency_code = EXCLUDED.currency_code,
  currency_symbol = EXCLUDED.currency_symbol;

ALTER TABLE country_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enable_all_authenticated_country_configs" ON country_configs;
CREATE POLICY "enable_all_authenticated_country_configs" ON country_configs
  FOR ALL USING (true) WITH CHECK (true);
