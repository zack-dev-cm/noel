#!/usr/bin/env bash
set -euo pipefail

ROLE="${SERVICE_ROLE:-web}"

if [ "$ROLE" = "worker" ]; then
  exec node apps/worker/dist/index.js
fi

if [ "$ROLE" = "all" ]; then
  export WORKER_HTTP_ENABLED="${WORKER_HTTP_ENABLED:-false}"
  node apps/worker/dist/index.js &
fi

exec node apps/server/dist/index.js
