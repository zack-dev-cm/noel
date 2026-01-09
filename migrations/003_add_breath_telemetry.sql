ALTER TABLE IF EXISTS telemetry_events
  ADD COLUMN IF NOT EXISTS breath_bpm REAL,
  ADD COLUMN IF NOT EXISTS breath_variability REAL,
  ADD COLUMN IF NOT EXISTS breath_coherence REAL,
  ADD COLUMN IF NOT EXISTS breath_phase TEXT,
  ADD COLUMN IF NOT EXISTS breath_source TEXT;
