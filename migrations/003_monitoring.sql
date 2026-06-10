-- ─── Migration 003: Monitoring, Feedback & Document Management ──────────────
-- Run once against your PostgreSQL database.
-- Safe to re-run: all statements use IF NOT EXISTS or DO $$ guards.

-- ─── 1. chat_logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL    DEFAULT now(),
  session_id       TEXT,
  query            TEXT        NOT NULL,
  rewritten_query  TEXT,
  intent           TEXT,
  answer_type      TEXT,                     -- MATCH | NO_MATCH
  retrieval_conf   TEXT,                     -- high | medium | low
  max_score        NUMERIC(5,4),
  chunks_returned  INT,
  input_chars      INT,
  output_chars     INT,
  latency_ms       INT,
  response_status  TEXT        NOT NULL DEFAULT 'ok'  -- ok | error | blocked
);

CREATE INDEX IF NOT EXISTS chat_logs_created_at_idx ON chat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_logs_session_id_idx ON chat_logs (session_id);

-- ─── 2. retrieval_logs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retrieval_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT now(),
  chat_log_id UUID        REFERENCES chat_logs(id) ON DELETE CASCADE,
  query       TEXT        NOT NULL,
  chunk_id    UUID,
  score       NUMERIC(5,4),
  rank        INT
);

CREATE INDEX IF NOT EXISTS retrieval_logs_chat_log_id_idx ON retrieval_logs (chat_log_id);
CREATE INDEX IF NOT EXISTS retrieval_logs_created_at_idx  ON retrieval_logs (created_at DESC);

-- ─── 3. model_logs ────────────────────────────────────────────────────────────
-- Approximate token counts (chars ÷ 4) stored for cost tracking.
CREATE TABLE IF NOT EXISTS model_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL    DEFAULT now(),
  chat_log_id   UUID        REFERENCES chat_logs(id) ON DELETE CASCADE,
  provider      TEXT,                     -- azure | ollama
  input_tokens  INT,
  output_tokens INT,
  cost_usd      NUMERIC(10,6)            -- optional, populated if pricing known
);

CREATE INDEX IF NOT EXISTS model_logs_created_at_idx ON model_logs (created_at DESC);

-- ─── 4. feedback ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT now(),
  session_id  TEXT,
  chat_log_id UUID        REFERENCES chat_logs(id) ON DELETE SET NULL,
  rating      TEXT        NOT NULL CHECK (rating IN ('up', 'down')),
  question    TEXT,
  answer      TEXT,
  comment     TEXT
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx  ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_session_id_idx  ON feedback (session_id);
CREATE INDEX IF NOT EXISTS feedback_rating_idx      ON feedback (rating);

-- ─── 5. documents — extend existing table ─────────────────────────────────────
-- The PgVectorStore already creates a `documents` table. We ADD columns for the
-- admin document-management UI.  Each ALTER is guarded so re-running is safe.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='original_filename'
  ) THEN
    ALTER TABLE documents ADD COLUMN original_filename TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='chunk_count'
  ) THEN
    ALTER TABLE documents ADD COLUMN chunk_count INT DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='status'
  ) THEN
    ALTER TABLE documents ADD COLUMN status TEXT DEFAULT 'indexed';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='uploaded_at'
  ) THEN
    ALTER TABLE documents ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='file_size_bytes'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_size_bytes INT;
  END IF;
END $$;
