ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS session_stop_enabled BOOLEAN NOT NULL DEFAULT false;

UPDATE admin_settings
SET session_stop_enabled = false
WHERE session_stop_enabled IS NULL;
