-- 006_session_insights.sql
-- Insight extraction storage + admin-editable intent phrase library

CREATE TABLE session_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  VARCHAR(64) NOT NULL,
  type        VARCHAR(30) NOT NULL,   -- 'fact' | 'pain_point' | 'goal' | 'preference'
                                      -- | 'competitor' | 'buying_signal' (open list, not enum)
  text        TEXT NOT NULL,
  source      VARCHAR(10) NOT NULL,   -- 'rule' | 'llm'
  confidence  NUMERIC,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_insights_session ON session_insights(session_id);
CREATE INDEX idx_session_insights_type    ON session_insights(type, created_at DESC);

-- Admin-editable intent phrase library.
-- Replaces hardcoded ESCALATION_EXEMPLARS_EN/JA arrays in draftTicket.ts
-- and drives the new Tier-A extractor.
CREATE TABLE intent_phrases (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language VARCHAR(5)  NOT NULL,   -- 'en' | 'ja' | '*' (language-agnostic)
  intent   VARCHAR(30) NOT NULL,   -- 'escalation' | 'buying_signal' | 'deployment_pref'
                                   -- | 'competitor' | 'roi_question' | 'demo_request'
  phrase   TEXT NOT NULL,
  active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_intent_phrases_intent ON intent_phrases(intent, language) WHERE active = TRUE;

-- ── Seed: Escalation intent (migrated from ESCALATION_EXEMPLARS_EN/JA) ──────
INSERT INTO intent_phrases (language, intent, phrase) VALUES
  ('en', 'escalation', 'I want to talk to a human'),
  ('en', 'escalation', 'can I speak to a real person'),
  ('en', 'escalation', 'I need a support agent'),
  ('en', 'escalation', 'please open a ticket for me'),
  ('en', 'escalation', 'create a support ticket'),
  ('en', 'escalation', 'I want to raise a ticket'),
  ('en', 'escalation', 'connect me to someone'),
  ('en', 'escalation', 'I need help from a person'),
  ('en', 'escalation', 'can you escalate this'),
  ('en', 'escalation', 'I want to contact support'),
  ('en', 'escalation', 'get me a representative'),
  ('en', 'escalation', 'I need to file a complaint'),
  ('en', 'escalation', 'this is urgent please help me'),
  ('en', 'escalation', 'nothing is working I need help'),
  ('en', 'escalation', 'I have been trying for hours'),
  ('en', 'escalation', 'still broken after everything'),
  ('en', 'escalation', 'tried everything still not working'),
  ('ja', 'escalation', '担当者に繋いでください'),
  ('ja', 'escalation', '人と話したい'),
  ('ja', 'escalation', 'チケットを作成してください'),
  ('ja', 'escalation', 'サポートに問い合わせたい'),
  ('ja', 'escalation', 'エスカレートしてください'),
  ('ja', 'escalation', '全然解決しない助けてください'),
  ('ja', 'escalation', 'ずっと試しているが直らない');

-- ── Seed: Buying signals ──────────────────────────────────────────────────────
INSERT INTO intent_phrases (language, intent, phrase) VALUES
  ('en', 'buying_signal', 'how much does it cost'),
  ('en', 'buying_signal', 'what is the price'),
  ('en', 'buying_signal', 'pricing plans'),
  ('en', 'buying_signal', 'how do I sign up'),
  ('en', 'buying_signal', 'I want to purchase'),
  ('en', 'buying_signal', 'request a demo'),
  ('en', 'buying_signal', 'book a demo'),
  ('en', 'buying_signal', 'schedule a call'),
  ('en', 'buying_signal', 'talk to sales'),
  ('en', 'buying_signal', 'get a quote'),
  ('en', 'buying_signal', 'what is the ROI'),
  ('en', 'buying_signal', 'return on investment'),
  ('en', 'buying_signal', 'how quickly can we implement'),
  ('en', 'buying_signal', 'what is the implementation timeline'),
  ('en', 'buying_signal', 'compare plans'),
  ('ja', 'buying_signal', '料金を教えてください'),
  ('ja', 'buying_signal', 'デモをお願いしたい'),
  ('ja', 'buying_signal', '導入したい'),
  ('ja', 'buying_signal', '費用対効果'),
  ('ja', 'buying_signal', '見積もりをお願いします');

-- ── Seed: ROI questions ───────────────────────────────────────────────────────
INSERT INTO intent_phrases (language, intent, phrase) VALUES
  ('en', 'roi_question', 'what is the ROI'),
  ('en', 'roi_question', 'return on investment'),
  ('en', 'roi_question', 'how much will I save'),
  ('en', 'roi_question', 'cost savings'),
  ('en', 'roi_question', 'payback period'),
  ('en', 'roi_question', 'how long to pay back'),
  ('en', 'roi_question', 'annual savings');

-- ── Seed: Deployment preferences ─────────────────────────────────────────────
INSERT INTO intent_phrases (language, intent, phrase) VALUES
  ('*', 'deployment_pref', 'Azure'),
  ('*', 'deployment_pref', 'AWS'),
  ('*', 'deployment_pref', 'Google Cloud'),
  ('*', 'deployment_pref', 'on-premise'),
  ('*', 'deployment_pref', 'on premise'),
  ('*', 'deployment_pref', 'self-hosted'),
  ('*', 'deployment_pref', 'cloud deployment'),
  ('*', 'deployment_pref', 'hybrid deployment'),
  ('*', 'deployment_pref', 'Japanese support'),
  ('*', 'deployment_pref', 'GDPR'),
  ('*', 'deployment_pref', 'data residency'),
  ('*', 'deployment_pref', 'オンプレミス'),
  ('*', 'deployment_pref', 'クラウド');

-- ── Seed: Demo requests ───────────────────────────────────────────────────────
INSERT INTO intent_phrases (language, intent, phrase) VALUES
  ('en', 'demo_request', 'request a demo'),
  ('en', 'demo_request', 'book a demo'),
  ('en', 'demo_request', 'schedule a demo'),
  ('en', 'demo_request', 'see a demo'),
  ('en', 'demo_request', 'watch a demo'),
  ('ja', 'demo_request', 'デモを見たい'),
  ('ja', 'demo_request', 'デモをお願いします');
