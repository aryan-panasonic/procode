-- 008_session_state.sql
-- Stores the latest JSON state extracted from the conversation per session, replacing the accumulating session_insights.

CREATE TABLE session_state (
  session_id  VARCHAR(64) PRIMARY KEY,
  state       JSONB NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
