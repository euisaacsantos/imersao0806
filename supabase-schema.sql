-- ============================================================
-- ADS DASHBOARD — Supabase Schema
-- Execute no SQL Editor do Supabase (https://app.supabase.com)
-- ============================================================

-- Tabela principal de vendas (recebida via webhook)
CREATE TABLE IF NOT EXISTS sales (
  id             BIGSERIAL PRIMARY KEY,
  sale_id        TEXT        NOT NULL UNIQUE,
  value          DECIMAL(10, 2) NOT NULL CHECK (value >= 0),
  campaign_id    TEXT,
  adset_id       TEXT,
  ad_id          TEXT,
  payment_method TEXT        NOT NULL DEFAULT 'pix'
                             CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'boleto', 'other')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas do dashboard
CREATE INDEX IF NOT EXISTS idx_sales_campaign_id  ON sales (campaign_id);
CREATE INDEX IF NOT EXISTS idx_sales_adset_id     ON sales (adset_id);
CREATE INDEX IF NOT EXISTS idx_sales_ad_id        ON sales (ad_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at   ON sales (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment      ON sales (payment_method);

-- Comentários das colunas
COMMENT ON TABLE  sales               IS 'Vendas recebidas via webhook do checkout';
COMMENT ON COLUMN sales.sale_id       IS 'ID único da venda no sistema de checkout (ex: ORD-2024-00123)';
COMMENT ON COLUMN sales.value         IS 'Valor da venda em BRL';
COMMENT ON COLUMN sales.campaign_id   IS 'ID da campanha Meta Ads que originou a venda';
COMMENT ON COLUMN sales.adset_id      IS 'ID do conjunto de anúncios Meta Ads';
COMMENT ON COLUMN sales.ad_id         IS 'ID do anúncio Meta Ads';
COMMENT ON COLUMN sales.payment_method IS 'Método de pagamento: pix | credit_card | debit_card | boleto | other';

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Apenas o service_role (backend/webhook) pode inserir
CREATE POLICY "service_role_insert"
  ON sales FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Apenas o service_role pode ler (dashboard usa service_role via API route)
CREATE POLICY "service_role_select"
  ON sales FOR SELECT
  TO service_role
  USING (true);

-- ============================================================
-- Views úteis para o dashboard
-- ============================================================

-- Vendas por método de pagamento
CREATE OR REPLACE VIEW v_sales_by_payment AS
SELECT
  payment_method,
  COUNT(*)          AS total_count,
  SUM(value)        AS total_value,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM sales
GROUP BY payment_method
ORDER BY total_count DESC;

-- Vendas por hora do dia
CREATE OR REPLACE VIEW v_sales_by_hour AS
SELECT
  EXTRACT(HOUR FROM created_at AT TIME ZONE 'America/Sao_Paulo')::INT AS hour,
  COUNT(*)   AS total_count,
  SUM(value) AS total_value
FROM sales
GROUP BY hour
ORDER BY hour;

-- Vendas agrupadas por campanha (para cruzar com Meta Ads)
CREATE OR REPLACE VIEW v_sales_by_campaign AS
SELECT
  campaign_id,
  adset_id,
  ad_id,
  COUNT(*)   AS total_sales,
  SUM(value) AS total_revenue
FROM sales
GROUP BY campaign_id, adset_id, ad_id
ORDER BY total_revenue DESC;

-- ============================================================
-- Dados de exemplo para testar o dashboard
-- (remova em produção)
-- ============================================================

INSERT INTO sales (sale_id, value, campaign_id, adset_id, ad_id, payment_method, created_at)
VALUES
  ('ORD-001', 197.00, 'camp_001', 'adset_001', 'ad_001', 'pix',         NOW() - INTERVAL '1 hour'),
  ('ORD-002', 297.00, 'camp_001', 'adset_001', 'ad_002', 'credit_card', NOW() - INTERVAL '2 hours'),
  ('ORD-003', 97.00,  'camp_001', 'adset_002', 'ad_003', 'boleto',      NOW() - INTERVAL '3 hours'),
  ('ORD-004', 197.00, 'camp_002', 'adset_004', 'ad_006', 'pix',         NOW() - INTERVAL '4 hours'),
  ('ORD-005', 497.00, 'camp_002', 'adset_005', 'ad_008', 'credit_card', NOW() - INTERVAL '5 hours')
ON CONFLICT (sale_id) DO NOTHING;
