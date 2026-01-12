UPDATE entitlements
SET expires_at = NOW() + INTERVAL '7 days'
WHERE type = 'guided_question' AND expires_at IS NULL;
