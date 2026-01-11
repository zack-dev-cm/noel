# Runbook: Deploy

## Current GCP Target
- Project: `energy-meters`
- Region: `us-east1`
- Cloud Run service: `noetic-mirror-web` (UI + API + research loop)
- Web URL: `https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app`
- Telegram WebApp: `https://t.me/noetic_mirror_bot/app`
- Cloud SQL: `energy-meters:us-east1:bvis-postgres` (db: `noetic_mirror`, user: `noetic_user`)
- Redis: `noetic-redis` (private)
- VPC connector: `medaudit-connector`

## Prerequisites
- GCP project ID and region (or your chosen cloud provider equivalents).
- Cloud Run service account with build + deploy permissions.
- VPC connector if Redis is private; otherwise use managed public Redis with auth.
- Secret Manager entries for:
  - OPENAI_API_KEY
  - GEMINI_API_KEY
  - TELEGRAM_BOT_TOKEN
  - DATABASE_URL
  - REDIS_URL
  - STREAM_PUBLISH_TOKEN
  - WEBHOOK_SECRET
- gcloud installed and authenticated.

## Environment Variables
- ENV (default: prod)
- INIT_DATA_MAX_AGE_SECONDS (default: 86400)
- WEB_APP_URL (Mini App base URL for deep links)
- WEB_APP_TMA_URL (t.me deeplink for channel buttons, required for `/post_tma`, e.g. `https://t.me/noetic_mirror_bot/app`)
- LOG_LEVEL (info|debug)
- SERVICE_ROLE (web|all; default: all)
- WORKER_HTTP_ENABLED (default: false when running worker inside web)
- SESSION_ID (default: public)
- ADMIN_TELEGRAM_IDS (comma-separated Telegram user IDs or usernames allowed for admin access)
  - Example: `ADMIN_TELEGRAM_IDS=rheuiii,123456`
- OPENAI_RESEARCHER_MODEL (default: gpt-5.2-2025-12-11)
- GEMINI_MODEL (default: gemini-3-pro-preview)
- GEMINI_FALLBACK_MODEL (default: gemini-flash-latest)
- SESSION_TOKEN_BUDGET (default: 100000)
- SESSION_BUDGET_SOFT (default: 80000)
- SESSION_COST_BUDGET (default: 0.1)
- SESSION_COST_BUDGET_SOFT (default: 0.08)
- SESSION_REQUEST_BUDGET (default: 40)
- SESSION_REQUEST_BUDGET_SOFT (default: 32)
- OPENAI_COST_PER_1K_TOKENS (set per model pricing)
- WORKER_TICK_SECONDS (default: 30)
- TOKEN_SAVER_MULTIPLIER (default: 0.6)
- DEFAULT_SESSION_LANGUAGE (default: en; en|ru)
- INITIAL_PROMPT_RU (optional RU override for initial prompt)
- PUBLIC_SESSION_UUID (optional; UUID used for public session storage)
- RESEARCHER_MAX_OUTPUT_TOKENS (default: 160)
- SUBJECT_MAX_OUTPUT_TOKENS (default: 220)
- RESEARCHER_MAX_OUTPUT_CHARS (default: 720)
- SUBJECT_MAX_OUTPUT_CHARS (default: 1000)
- RESEARCHER_MAX_OUTPUT_TOKENS_SAVER (default: 120)
- SUBJECT_MAX_OUTPUT_TOKENS_SAVER (default: 160)
- RESEARCHER_MAX_OUTPUT_CHARS_SAVER (default: 520)
- SUBJECT_MAX_OUTPUT_CHARS_SAVER (default: 700)
- STREAM_PUBLISH_TOKEN (worker -> web internal auth)
- PUBLIC_CHANNEL_ID (default: @noel_mirror)
- ENABLE_PUBLIC_CHANNEL_POSTS (true|false)
- ENABLE_PUBLIC_CHANNEL_STREAM (optional; defaults to ENABLE_PUBLIC_CHANNEL_POSTS)
- PUBLIC_CHANNEL_STREAM_PRIVATE (true|false; default: false)
- STARS_STARGAZER (default: 10)
- STARS_COSMIC_PATRON (default: 100)
- STARS_UNIVERSAL_ARCHITECT (default: 1000)
- STARS_INTERVENTION (default: 50)
- STARS_PRIVATE_SESSION (default: 100)

## Build + Deploy (Scripted)
If `infra/gcp/deploy.sh` exists:
```bash
chmod +x infra/gcp/deploy.sh
PROJECT_ID=<PROJECT_ID> REGION=<REGION> WEB_APP_URL=<WEB_APP_URL> \
  infra/gcp/deploy.sh
```

## Build + Deploy (Manual)
```bash
# Build container image
PROJECT_ID=<PROJECT_ID>
REGION=<REGION>
SERVICE=noetic-mirror-web
IMAGE=gcr.io/$PROJECT_ID/noetic-mirror:latest

PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH \
  gcloud builds submit --project "$PROJECT_ID" --tag "$IMAGE"

# Deploy Cloud Run (single service: web + worker)
PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH \
  gcloud run deploy "$SERVICE" \
  --project "$PROJECT_ID" --region "$REGION" \
  --image "$IMAGE" \
  --platform managed --allow-unauthenticated \
  --service-account <SERVICE_ACCOUNT> \
  --add-cloudsql-instances <CLOUDSQL_INSTANCE> \
  --vpc-connector <VPC_CONNECTOR> --vpc-egress private-ranges-only \
  --set-secrets OPENAI_API_KEY=<SECRET_NAME>:latest,GEMINI_API_KEY=<SECRET_NAME>:latest,TELEGRAM_BOT_TOKEN=<SECRET_NAME>:latest,DATABASE_URL=<SECRET_NAME>:latest,REDIS_URL=<SECRET_NAME>:latest,STREAM_PUBLISH_TOKEN=<SECRET_NAME>:latest,WEBHOOK_SECRET=<SECRET_NAME>:latest \
  --set-env-vars ENV=prod,SERVICE_ROLE=all,WORKER_HTTP_ENABLED=false,SESSION_ID=public,INIT_DATA_MAX_AGE_SECONDS=86400,WEB_APP_URL=<WEB_APP_URL>,WEBHOOK_BASE_URL=<WEB_APP_URL>,STREAM_PUBLISH_URL=<WEB_APP_URL>,INTERVENTION_API_BASE=<WEB_APP_URL>,SETTINGS_API_BASE=<WEB_APP_URL> \
  --cpu 2 --memory 2Gi --concurrency 10 --min-instances 1 --max-instances 1 --no-cpu-throttling
```

## Deploy Debug Loop (Required)
1. Run local E2E headed and inspect screenshots:
   - `npm run e2e`
2. Deploy to production (script or manual).
3. Run headed Playwright against prod and inspect screenshots/traces:
   - `PLAYWRIGHT_BASE_URL=https://<SERVICE_URL> npx playwright test --headed`
4. If any failure or visual regression:
   - Debug locally, redeploy, re-run Playwright, and repeat until clean.

## Debugging Notes (Cheap Models)
- For debugging, override `OPENAI_RESEARCHER_MODEL` and `GEMINI_MODEL` with faster, lower-cost models.
  - Example: `OPENAI_RESEARCHER_MODEL=gpt-4o-mini`
  - Example: `GEMINI_MODEL=gemini-3-flash-preview`

## Post-Deploy Checks
- Health check: `curl -i https://<SERVICE_URL>/healthz`
- Web app URL loads in Telegram WebApp settings.
- Webhook configured (check logs for `webhook_configured` event).
- Run E2E against prod:
  - `PLAYWRIGHT_BASE_URL=https://<SERVICE_URL> npx playwright test --headed`
- Inspect logs:
  - `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=<SERVICE>" --project <PROJECT_ID> --limit 100`

## Stop/Resume Research Loop
- Stop: redeploy with `SERVICE_ROLE=web` to disable the worker loop.
- Resume: redeploy with `SERVICE_ROLE=all`.

## Rollback
```bash
gcloud run services update-traffic <SERVICE> \
  --project <PROJECT_ID> --region <REGION> --to-revisions <REVISION>=100
```
