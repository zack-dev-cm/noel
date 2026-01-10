# Runbook: Operations

## Log Tailing
```bash
PROJECT_ID=<PROJECT_ID>
SERVICE=noetic-mirror-web

# Cloud Run logs
PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH \
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE" \
  --project "$PROJECT_ID" --limit 100 --format 'value(textPayload)'
```

## Retention
- Public session transcripts: 30 days.
- Private session transcripts: 14 days.
- Telemetry + ops logs: 14 days.
- Logs use hashed user IDs; initData is never stored.

## Safety Thresholds
- Kill switch: distress score >= 0.95.
- Pause: distress score >= 0.85 or >= 0.60 for 3 consecutive turns.

## Alert Policy (5xx)
```bash
gcloud alpha monitoring policies create \
  --project <PROJECT_ID> \
  --policy-from-file infra/gcp/alert-policy-5xx.json
```

## Common Log Queries
- Logs use hashed user IDs (field `user_id`).
- 5xx errors:
  `resource.type=cloud_run_revision AND resource.labels.service_name=<SERVICE> AND httpRequest.status>=500`
- initData validation failures:
  `resource.type=cloud_run_revision AND jsonPayload.event="auth_failed"`
- WebSocket disconnects:
  `resource.type=cloud_run_revision AND jsonPayload.event="ws_disconnect"`
- Worker failures:
  `resource.type=cloud_run_revision AND jsonPayload.event="worker_failed"`
- Gemini fallback:
  `resource.type=cloud_run_revision AND jsonPayload.event="gemini_fallback"`
- Subject pipeline requests:
  `resource.type=cloud_run_revision AND jsonPayload.event="subject_request"`
- Subject pipeline requests (worker service only):
  `resource.type=cloud_run_revision AND resource.labels.service_name="noetic-mirror-worker" AND jsonPayload.event="subject_request"`
- Subject pipeline responses:
  `resource.type=cloud_run_revision AND jsonPayload.event="subject_response"`
- Subject pipeline responses (worker service only):
  `resource.type=cloud_run_revision AND resource.labels.service_name="noetic-mirror-worker" AND jsonPayload.event="subject_response"`
- Subject empty responses:
  `resource.type=cloud_run_revision AND jsonPayload.event="subject_empty_response"`
- Stream empty content:
  `resource.type=cloud_run_revision AND jsonPayload.event="stream_empty_content"`
- Session budget exceeded:
  `resource.type=cloud_run_revision AND jsonPayload.event="session_budget_exceeded"`
- Stream publish failures:
  `resource.type=cloud_run_revision AND jsonPayload.event="stream_publish_failed"`
- Stream publish errors:
  `resource.type=cloud_run_revision AND jsonPayload.event="stream_publish_error"`
- Preferences updates:
  `resource.type=cloud_run_revision AND jsonPayload.event="preferences_updated"`
- Session language updates:
  `resource.type=cloud_run_revision AND jsonPayload.event="session_language_updated"`
- Payment failures:
  `resource.type=cloud_run_revision AND jsonPayload.event="payment_failed"`
- Payment receipts:
  `resource.type=cloud_run_revision AND jsonPayload.event="payment_received"`
- Admin changes:
  `resource.type=cloud_run_revision AND jsonPayload.event="admin_settings_updated"`
- Payment catalog mismatch:
  `resource.type=cloud_run_revision AND jsonPayload.event="payment_unknown_type"`
- Webhook setup:
  `resource.type=cloud_run_revision AND jsonPayload.event="webhook_configured"`
- Image generation failures:
  `resource.type=cloud_run_revision AND jsonPayload.event="image_generation_failed"`

## E2E Verification
- Install Playwright browsers:
  - `npx playwright install --with-deps`
- Generate initData for prod runs (uses bot token):
  - `PLAYWRIGHT_INIT_DATA=$(TELEGRAM_BOT_TOKEN=$(gcloud secrets versions access latest --secret=noetic-telegram-bot-token --project energy-meters) node scripts/generate_init_data.js)`
- Headed E2E run:
  - Local: `PLAYWRIGHT_BASE_URL=http://localhost:8787 PLAYWRIGHT_API_BASE_URL=http://localhost:8787 npx playwright test --headed`
  - Prod: `PLAYWRIGHT_INIT_DATA=$PLAYWRIGHT_INIT_DATA PLAYWRIGHT_BASE_URL=https://<SERVICE_URL> PLAYWRIGHT_API_BASE_URL=https://<SERVICE_URL> npx playwright test --headed`
- View report:
  - `npx playwright show-report`

## Reference Session Check
- Start a known-good public session and confirm:
  - Researcher and Subject streams render within 2-4 seconds.
  - Reconnect logic replays missing tokens.
  - Telemetry widgets update.
- Verify logs contain:
  - session_start
  - researcher_stream
  - subject_stream
  - session_end
