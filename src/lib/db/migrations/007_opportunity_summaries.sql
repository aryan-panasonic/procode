-- 007_opportunity_summaries.sql
-- Cache table for on-demand LLM opportunity summaries (one call per session, cached)

CREATE TABLE opportunity_summaries (
  session_id  VARCHAR(64) PRIMARY KEY,
  summary     TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
