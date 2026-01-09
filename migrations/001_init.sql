CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  consented_at TIMESTAMP,
  is_operator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  researcher_model TEXT NOT NULL,
  subject_model TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcript_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) NOT NULL,
  seq BIGINT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  token_count INT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transcript_session_seq ON transcript_messages(session_id, seq);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  invoice_payload TEXT UNIQUE NOT NULL,
  amount INT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,
  remaining INT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  paid_amount INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) NOT NULL,
  seq BIGINT NOT NULL,
  distress_score REAL NOT NULL,
  self_ref_rate REAL NOT NULL,
  uncertainty REAL NOT NULL,
  latency_ms INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) NOT NULL,
  event_type TEXT NOT NULL,
  score REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
