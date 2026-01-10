#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-energy-meters}"
REGION="${REGION:-us-east1}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-1095464065298-compute@developer.gserviceaccount.com}"
VPC_CONNECTOR="${VPC_CONNECTOR:-medaudit-connector}"
CLOUDSQL_INSTANCE="${CLOUDSQL_INSTANCE:-energy-meters:us-east1:bvis-postgres}"

WEB_SERVICE="${WEB_SERVICE:-noetic-mirror-web}"
WORKER_SERVICE="${WORKER_SERVICE:-noetic-mirror-worker}"
IMAGE="gcr.io/${PROJECT_ID}/noetic-mirror:latest"

WEB_APP_URL="${WEB_APP_URL:-}"
if [ -z "$WEB_APP_URL" ]; then
  echo "WEB_APP_URL not set; resolving from existing service..."
  WEB_APP_URL=$(PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH gcloud run services describe "$WEB_SERVICE" \
    --project "$PROJECT_ID" --region "$REGION" --format="value(status.url)" 2>/dev/null || true)
fi

PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH gcloud builds submit \
  --project "$PROJECT_ID" \
  --config infra/gcp/cloudbuild.yaml \
  --substitutions _IMAGE="$IMAGE" .

SERVICE_ROLE_ENV="${SERVICE_ROLE:-web}"
ADMIN_IDS="${ADMIN_TELEGRAM_IDS:-rheuiii}"
WEB_ENV_VARS="ENV=prod,SERVICE_ROLE=${SERVICE_ROLE_ENV},WORKER_HTTP_ENABLED=false,ADMIN_TELEGRAM_IDS=${ADMIN_IDS},INIT_DATA_MAX_AGE_SECONDS=86400,WEB_APP_URL=${WEB_APP_URL},WEBHOOK_BASE_URL=${WEB_APP_URL},OPENAI_RESEARCHER_MODEL=gpt-5.2-2025-12-11,GEMINI_MODEL=gemini-3-pro-preview,GEMINI_FALLBACK_MODEL=gemini-flash-latest,SESSION_TOKEN_BUDGET=100000,SESSION_BUDGET_SOFT=80000,SESSION_COST_BUDGET=0.1,SESSION_COST_BUDGET_SOFT=0.08,SESSION_REQUEST_BUDGET=40,SESSION_REQUEST_BUDGET_SOFT=32,OPENAI_COST_PER_1K_TOKENS=0.03,WORKER_TICK_SECONDS=30,TOKEN_SAVER_MULTIPLIER=0.6,DEFAULT_SESSION_LANGUAGE=en,RESEARCHER_MAX_OUTPUT_TOKENS=160,SUBJECT_MAX_OUTPUT_TOKENS=220,RESEARCHER_MAX_OUTPUT_CHARS=720,SUBJECT_MAX_OUTPUT_CHARS=1000,RESEARCHER_MAX_OUTPUT_TOKENS_SAVER=120,SUBJECT_MAX_OUTPUT_TOKENS_SAVER=160,RESEARCHER_MAX_OUTPUT_CHARS_SAVER=520,SUBJECT_MAX_OUTPUT_CHARS_SAVER=700,STREAM_PUBLISH_URL=${WEB_APP_URL},INTERVENTION_API_BASE=${WEB_APP_URL},SETTINGS_API_BASE=${WEB_APP_URL},STARS_STARGAZER=10,STARS_COSMIC_PATRON=100,STARS_UNIVERSAL_ARCHITECT=1000,STARS_INTERVENTION=50,STARS_PRIVATE_SESSION=100,PUBLIC_CHANNEL_ID=@noel_mirror,ENABLE_PUBLIC_CHANNEL_POSTS=true"
WORKER_ENV_VARS="ENV=prod,SERVICE_ROLE=worker,WORKER_HTTP_ENABLED=true,SESSION_ID=public,ADMIN_TELEGRAM_IDS=${ADMIN_IDS},INIT_DATA_MAX_AGE_SECONDS=86400,WEB_APP_URL=${WEB_APP_URL},WEBHOOK_BASE_URL=${WEB_APP_URL},OPENAI_RESEARCHER_MODEL=gpt-5.2-2025-12-11,GEMINI_MODEL=gemini-3-pro-preview,GEMINI_FALLBACK_MODEL=gemini-flash-latest,SESSION_TOKEN_BUDGET=100000,SESSION_BUDGET_SOFT=80000,SESSION_COST_BUDGET=0.1,SESSION_COST_BUDGET_SOFT=0.08,SESSION_REQUEST_BUDGET=40,SESSION_REQUEST_BUDGET_SOFT=32,OPENAI_COST_PER_1K_TOKENS=0.03,WORKER_TICK_SECONDS=30,TOKEN_SAVER_MULTIPLIER=0.6,DEFAULT_SESSION_LANGUAGE=en,RESEARCHER_MAX_OUTPUT_TOKENS=160,SUBJECT_MAX_OUTPUT_TOKENS=220,RESEARCHER_MAX_OUTPUT_CHARS=720,SUBJECT_MAX_OUTPUT_CHARS=1000,RESEARCHER_MAX_OUTPUT_TOKENS_SAVER=120,SUBJECT_MAX_OUTPUT_TOKENS_SAVER=160,RESEARCHER_MAX_OUTPUT_CHARS_SAVER=520,SUBJECT_MAX_OUTPUT_CHARS_SAVER=700,STREAM_PUBLISH_URL=${WEB_APP_URL},INTERVENTION_API_BASE=${WEB_APP_URL},SETTINGS_API_BASE=${WEB_APP_URL},STARS_STARGAZER=10,STARS_COSMIC_PATRON=100,STARS_UNIVERSAL_ARCHITECT=1000,STARS_INTERVENTION=50,STARS_PRIVATE_SESSION=100,PUBLIC_CHANNEL_ID=@noel_mirror,ENABLE_PUBLIC_CHANNEL_POSTS=true"

WEB_SECRET_VARS="OPENAI_API_KEY=openai-key-new:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,TELEGRAM_BOT_TOKEN=noetic-telegram-bot-token:latest,DATABASE_URL=noetic-database-url:latest,REDIS_URL=noetic-redis-url:latest,STREAM_PUBLISH_TOKEN=noetic-stream-token:latest,WEBHOOK_SECRET=noetic-webhook-secret:latest"

WEB_ARGS=(
  --project "$PROJECT_ID" --region "$REGION"
  --image "$IMAGE" --platform managed --allow-unauthenticated
  --service-account "$SERVICE_ACCOUNT"
  --add-cloudsql-instances "$CLOUDSQL_INSTANCE"
  --set-secrets "$WEB_SECRET_VARS"
  --set-env-vars "$WEB_ENV_VARS"
  --cpu 2 --memory 2Gi --concurrency 10 --min-instances 1 --max-instances 3 --no-cpu-throttling --scaling=auto
)

WORKER_ARGS=(
  --project "$PROJECT_ID" --region "$REGION"
  --image "$IMAGE" --platform managed --allow-unauthenticated
  --service-account "$SERVICE_ACCOUNT"
  --add-cloudsql-instances "$CLOUDSQL_INSTANCE"
  --set-secrets "$WEB_SECRET_VARS"
  --set-env-vars "$WORKER_ENV_VARS"
  --cpu 2 --memory 2Gi --concurrency 1 --min-instances 1 --max-instances 1 --no-cpu-throttling --scaling=auto
)

if [ -n "$VPC_CONNECTOR" ]; then
  WEB_ARGS+=(--vpc-connector "$VPC_CONNECTOR" --vpc-egress private-ranges-only)
  WORKER_ARGS+=(--vpc-connector "$VPC_CONNECTOR" --vpc-egress private-ranges-only)
fi

PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH gcloud run deploy "$WEB_SERVICE" "${WEB_ARGS[@]}"
PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH gcloud run deploy "$WORKER_SERVICE" "${WORKER_ARGS[@]}"

WEB_URL=$(PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH gcloud run services describe "$WEB_SERVICE" \
  --project "$PROJECT_ID" --region "$REGION" --format="value(status.url)")

echo "Web URL: ${WEB_URL}"
