CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY,
  token_saver_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO admin_settings (id, token_saver_enabled)
VALUES ('default', false)
ON CONFLICT (id) DO NOTHING;
