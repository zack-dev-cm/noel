# Repository Agent Instructions

## Scope
These instructions apply to all agents operating in this repository. Follow them strictly.

## Mandatory Multiagent Process
Follow the multiagent development practices at /Users/zack/Documents/GitHub/agents.
Required stages and cycles:
- Analysis (PRD/TZ): max 2 review cycles.
- Architecture: max 2 review cycles.
- Planning: max 1 review cycle (2 reviews total).
- Development: max 1 fix cycle per task.

Rules:
- Do not exceed role boundaries (analyst, architect, planner, developer, reviewers).
- Record blocking questions and stop for user input.
- Maintain status in status.md and open questions in open_questions.md.

## Supplemental Roles (When Needed)
- QA/E2E: run Playwright headed, inspect screenshots/traces, report failures.
- Release Manager: execute deploy loop, validate logs, and record evidence.

## Required Artifacts
- PRD.md (product requirements).
- ARCHITECTURE.md (system design and interfaces).
- DEV_PLAN.md (task plan).
- status.md (stage/task status).
- open_questions.md (blocking questions).
- docs/runbooks/deploy.md (deploy runbook).
- docs/runbooks/ops.md (ops runbook).
- docs/image-generation.md (image generation guidance).

## OpenAI API Best Practices (Required)
Follow best practices from:
- /Users/zack/Documents/GitHub/openai-cookbook/
- /Users/zack/Documents/GitHub/openai-agents-python/
- /Users/zack/Documents/GitHub/openai-agents-python/docs
- /Users/zack/Documents/GitHub/openai-chatkit-advanced-samples

Minimum requirements:
- Use the OpenAI Responses API by default; only use Chat Completions when required.
- Prefer structured outputs and JSON schema for tool calls.
- Keep prompts explicit and decomposed for complex tasks.
- Do not show chain-of-thought or raw reasoning to end users.
- Use input/output guardrails for safety and cost control.
- Track token usage and enforce budgets per session.
- Use tracing in development; disable or restrict sensitive logs where needed.
- Implement retries with exponential backoff for rate limits and transient errors.
- Keep secrets in env vars; never commit keys.
- Sanitize and bound untrusted text to reduce prompt injection risk.
- Minimize sensitive data in prompts; redact where possible.

## ChatKit Guidance (If Used)
- Export OPENAI_API_KEY and VITE_CHATKIT_API_DOMAIN_KEY.
- Add the domain to the OpenAI allowlist and Vite allowedHosts.
- Keep backend and frontend separated and run both locally for development.

## Testing and Release (Strict)
- Strictly test e2e with Playwright.
- Inspect screenshots and Playwright results visually for every run.
- Debug, deploy, re-test e2e, debug, redeploy again until clean.

## Definition of Done (DoD)
- Playwright e2e passes (headed run + screenshot/trace inspection).
- Deploy -> e2e -> debug -> redeploy loop completed.
- Secrets stored in Secret Manager (or equivalent).
- OpenAI best practices applied (usage tracking, guardrails, retries).
- Observability configured (structured logs + alerts).
- Documentation updated (PRD/DEV_PLAN/AGENTS + runbooks).

## CI/CD and Deploy Practices
- Prefer containerized builds and a Cloud Run-style deploy target.
- Use a deploy script (e.g., `infra/gcp/deploy.sh`) and document it in runbooks.
- Use Secret Manager for API keys and bot tokens; never bake secrets into images.
- Limit concurrency to 1 for heavy sessions; set min/max instances explicitly.
- Resolve `WEB_APP_URL` from existing service when not provided to preserve deep links.
- Use VPC connector for private Redis or switch to a managed public Redis with auth.
- Run tests in CI before deploy; include vulnerability scanning when possible.

## Logging and Monitoring
- Emit structured JSON logs with session_id, user_id, and event name.
- Add Cloud Logging filters for auth failures, websocket drops, and model errors.
- Maintain `docs/runbooks/ops.md` with common queries and alerts.

## Image Generation (When Used)
- Default to `OPENAI_IMAGE_MODEL` (gpt-image-1) via `images.generate`.
- Use prompt guidance: photorealistic editorial, no text/logos/UI, avoid identifiable faces.
- Use size 1024x1024 unless a different size is required.
- Decode `b64_json`, detect content type, and upload to GCS/S3 before storing URLs.
- Gracefully skip image generation if storage is unavailable; log and continue.
- If using Gemini, call `generativelanguage.googleapis.com` and parse inline image data.

## Security and Privacy
- Validate Telegram initData signatures server-side.
- Redact or hash user identifiers in logs.
- Avoid storing secrets in client code or git.

## Commit and Push
- Use concise, imperative commit messages.
- Create and push to a private repo using DEV_CM_GITHUB_TOKEN from bashrc.
