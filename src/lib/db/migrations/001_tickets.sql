CREATE TABLE IF NOT EXISTS tickets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  summary              TEXT,
  category             TEXT,
  priority             TEXT NOT NULL DEFAULT 'medium',
  status               TEXT NOT NULL DEFAULT 'open',
  customer_name        TEXT,
  customer_email       TEXT,
  customer_phone       TEXT,
  session_id           TEXT,
  conversation_summary TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tickets_status_idx    ON tickets(status);
CREATE INDEX IF NOT EXISTS tickets_session_idx   ON tickets(session_id);
CREATE INDEX IF NOT EXISTS tickets_created_idx   ON tickets(created_at DESC);

CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tickets_updated_at ON tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_tickets_updated_at();
