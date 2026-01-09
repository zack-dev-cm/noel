# Runbook: Deploy

## Current GCP Target
- Project: `energy-meters`
- Region: `us-east1`
- Cloud Run service: `noetic-mirror-web` (single service runs UI + API + worker loop)
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
- LOG_LEVEL (info|debug)
- SERVICE_ROLE (default: web; set to all to run worker loop)
- WORKER_HTTP_ENABLED (default: false for single service)
- ADMIN_TELEGRAM_IDS (comma-separated Telegram user IDs allowed for admin access)
- OPENAI_RESEARCHER_MODEL (default: gpt-5-mini in dev, gpt-5 in prod)
- GEMINI_MODEL (default: gemini-3.0-pro)
- GEMINI_FALLBACK_MODEL (default: gemini-1.5-flash)
- SESSION_TOKEN_BUDGET (default: 100000)
- SESSION_BUDGET_SOFT (default: 80000)
- SESSION_COST_BUDGET (default: 3.0)
- SESSION_COST_BUDGET_SOFT (default: 2.4)
- OPENAI_COST_PER_1K_TOKENS (set per model pricing)
- WORKER_TICK_SECONDS (default: 30)
- TOKEN_SAVER_MULTIPLIER (default: 0.6)
- RESEARCHER_MAX_OUTPUT_TOKENS (default: 240)
- SUBJECT_MAX_OUTPUT_TOKENS (default: 280)
- RESEARCHER_MAX_OUTPUT_CHARS (default: 1200)
- SUBJECT_MAX_OUTPUT_CHARS (default: 1400)
- RESEARCHER_MAX_OUTPUT_TOKENS_SAVER (default: 160)
- SUBJECT_MAX_OUTPUT_TOKENS_SAVER (default: 200)
- RESEARCHER_MAX_OUTPUT_CHARS_SAVER (default: 800)
- SUBJECT_MAX_OUTPUT_CHARS_SAVER (default: 1000)
- STREAM_PUBLISH_TOKEN (worker -> web internal auth)
- PUBLIC_CHANNEL_ID (default: @noel_mirror)
- ENABLE_PUBLIC_CHANNEL_POSTS (true|false)
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

# Deploy Cloud Run (single service)
PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH \
  gcloud run deploy "$SERVICE" \
  --project "$PROJECT_ID" --region "$REGION" \
  --image "$IMAGE" \
  --platform managed --allow-unauthenticated \
  --service-account <SERVICE_ACCOUNT> \
  --add-cloudsql-instances <CLOUDSQL_INSTANCE> \
  --vpc-connector <VPC_CONNECTOR> --vpc-egress private-ranges-only \
  --set-secrets OPENAI_API_KEY=<SECRET_NAME>:latest,GEMINI_API_KEY=<SECRET_NAME>:latest,TELEGRAM_BOT_TOKEN=<SECRET_NAME>:latest,DATABASE_URL=<SECRET_NAME>:latest,REDIS_URL=<SECRET_NAME>:latest,STREAM_PUBLISH_TOKEN=<SECRET_NAME>:latest,WEBHOOK_SECRET=<SECRET_NAME>:latest \
  --set-env-vars ENV=prod,SERVICE_ROLE=all,WORKER_HTTP_ENABLED=false,INIT_DATA_MAX_AGE_SECONDS=86400,WEB_APP_URL=<WEB_APP_URL>,WEBHOOK_BASE_URL=<WEB_APP_URL>,STREAM_PUBLISH_URL=<WEB_APP_URL>,INTERVENTION_API_BASE=<WEB_APP_URL> \
  --cpu 2 --memory 2Gi --concurrency 10 --min-instances 1 --max-instances 3 --no-cpu-throttling
```

## Post-Deploy Checks
- Health check: `curl -i https://<SERVICE_URL>/healthz`
- Web app URL loads in Telegram WebApp settings.
- Webhook configured (check logs for `webhook_configured` event).
- Run E2E against prod:
  - `PLAYWRIGHT_BASE_URL=https://<SERVICE_URL> npx playwright test --headed`
- Inspect logs:
  - `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=<SERVICE>" --project <PROJECT_ID> --limit 100`

## Stop/Resume Research Loop
- Stop: set `SERVICE_ROLE=web` (worker loop disabled).
- Resume: set `SERVICE_ROLE=all`.

## Rollback
```bash
gcloud run services update-traffic <SERVICE> \
  --project <PROJECT_ID> --region <REGION> --to-revisions <REVISION>=100
```
