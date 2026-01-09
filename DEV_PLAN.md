# Project Noetic Mirror - DEV_PLAN

## Principles and Constraints
- Follow the multiagent development process in /Users/zack/Documents/GitHub/agents.
- Maintain status in status.md and track open questions in open_questions.md.
- Use a top-down approach: create stubs first, then replace with real logic.
- Start end-to-end testing from the first milestone; do not defer E2E coverage.
- Follow OpenAI API best practices from:
  - /Users/zack/Documents/GitHub/openai-cookbook/
  - /Users/zack/Documents/GitHub/openai-agents-python/
  - /Users/zack/Documents/GitHub/openai-agents-python/docs
  - /Users/zack/Documents/GitHub/openai-chatkit-advanced-samples
- Strictly test e2e with Playwright and visually inspect screenshots; debug, deploy, re-test, debug, redeploy until clean.

## Milestones
### M0: Repo Initialization and Governance
Deliverables:
- Private GitHub repo created and pushed.
- Core docs: PRD.md, DEV_PLAN.md, AGENTS.md.
- status.md with stage tracking.

Tasks:
- Initialize git repo and create private GitHub repo.
- Commit and push using DEV_CM_GITHUB_TOKEN from bashrc.

Acceptance:
- Repo exists on GitHub (private).
- Docs committed on main.

### M1: Architecture Specification
Deliverables:
- ARCHITECTURE.md (system components, data flows, interfaces).
- Security and safety model (consent, kill switch, tracing).

Tasks:
- Define Bot, WebApp, API, WebSocket, and storage boundaries.
- Define OpenAI and Gemini integration contracts.

Acceptance:
- Architecture doc reviewed and approved.

### M2: Backend Foundation
Deliverables:
- Node.js or Go backend with REST + WebSocket server.
- Auth validation for Telegram initData.
- Session state store (Postgres + Redis).

Tasks:
- Implement session lifecycle and state store.
- WebSocket streaming with sequence IDs and reconnect replay.

Tests:
- Integration tests for auth and reconnect logic.

Acceptance:
- Clients reconnect without missing tokens.

### M3: Agent Orchestration
Deliverables:
- Researcher/Subject loop with streaming outputs.
- Guardrails and distress detection.

Tasks:
- OpenAI Researcher integration using Responses API.
- Gemini Subject integration with context caching.
- Guardrails for input/output; kill switch.
- Usage tracking and budget caps.

Tests:
- Mocked model tests and regression suite.

Acceptance:
- Deterministic loop behavior with safety triggers.

### M4: Frontend Mini App
Deliverables:
- Retro terminal UI with dual streams.
- Intervention controls and telemetry widgets.

Tasks:
- Build React/Next UI using Telegram WebApp SDK.
- WebSocket client with auto-reconnect.
- UI states for paid interventions.

Tests:
- Component tests for stream rendering and UI states.

Acceptance:
- Smooth streaming on mobile and desktop.

### M5: Payments and Monetization
Deliverables:
- Telegram Stars invoicing and entitlement gates.

Tasks:
- Bot payment handlers and invoice creation.
- Backend entitlement checks for interventions.

Tests:
- Sandbox payment flow verification.

Acceptance:
- Paid interventions unlock immediately.

### M6: CI/CD, Deploy, and Runbooks
Deliverables:
- Deploy script (infra/gcp/deploy.sh) and Cloud Build config.
- GitHub Actions workflow (test -> build -> deploy).
- Runbooks: docs/runbooks/deploy.md and docs/runbooks/ops.md.
- Structured logging + alert policy (5xx) and common log queries.
- Secret Manager integration for all API keys and tokens.

Tasks:
- Add deploy script that sets concurrency, min/max instances, VPC connector, and resolves WEB_APP_URL if unset.
- Add runbooks with deploy, rollback, and log inspection steps.
- Add CI workflow to run lint/tests and Playwright before deploy.
- Containerize services and add optional vulnerability scanning (e.g., Trivy).
- Enable structured logging and tracing with redaction controls.

Acceptance:
- Deploy runbook works end-to-end with a dry-run or staging service.
- Logs and traces are visible with consistent event names.

### M7: QA and Release
Deliverables:
- Playwright E2E suite with screenshots.
- Staging and production deployment scripts.

Tasks:
- E2E coverage for onboarding, streaming, payment, intervention.
- Visual inspection of screenshots each run.
- Deploy to staging, run E2E, debug, redeploy.
- Deploy to production and repeat E2E.

Acceptance:
- All E2E tests pass and screenshots are approved.

### M8: Subject Breath Telemetry
Deliverables:
- Synthetic Subject breath metrics attached to telemetry events.
- Optional self-report (strict JSON schema) behind a config flag.
- WebApp breath widget with cadence/variability display and synthetic label.
- Storage schema updates for breath metrics.

Tasks:
- Extend shared telemetry types and worker computation for breath metrics.
- Add migrations and persistence for breath fields in telemetry events.
- Update WebApp to render breath widget and labels.
- Add unit/integration tests and E2E coverage for breath telemetry.

Acceptance:
- Breath telemetry appears for Subject turns with source tags and synthetic labeling.
- No chain-of-thought or free-text self-report is stored or streamed.

### M9: UX Refresh + Output Controls
Deliverables:
- Updated UI/UX aligned to mocks with clearer process mapping and analysis view.
- Admin page for token saver mode.
- Response length caps and prompt guidance to keep outputs concise.

Tasks:
- Redesign dashboard, logs, and stars layout to match the mock visual language.
- Add exchange diagram and animated process map for readability.
- Implement admin-only settings endpoint + UI toggle for token saver mode.
- Enforce response caps via max output tokens/chars and concise prompts.

Tests:
- Update Playwright coverage for new UI labels and admin page access.
- Validate response truncation in worker unit/integration tests.

Acceptance:
- UI matches mock-inspired layout with readable process flow and animations.
- Admin toggle persists and affects session budgets.
- Model outputs stay within configured caps.

### M9: Admin Model Version Display
Deliverables:
- Admin UI displays configured Researcher and Subject model versions.
- Admin settings API includes model version payload.

Tasks:
- Extend admin settings endpoint to return model version configuration.
- Update AdminPanel UI to render model versions (and optional fallback).

Tests:
- Playwright E2E suite (headed) with visual inspection.

Acceptance:
- Admin tab shows model versions that match server configuration.

## Tooling and Stack
- Frontend: React 19 + Tailwind CSS (TMA).
- Backend: Node.js/Express or Go.
- Realtime: WebSocket (WSS).
- Storage: Postgres + Redis.
- Observability: OpenAI Traces + structured logs.
- CI/CD: GitHub Actions + Cloud Build (or equivalent).
- Hosting: Cloud Run (or equivalent).
- Artifacts: GCS/S3 for images and logs (if needed).

## Release Workflow (Strict)
1. Run Playwright e2e tests and inspect screenshots visually.
2. Debug any failures.
3. Deploy to staging (per docs/runbooks/deploy.md).
4. Re-run Playwright e2e and inspect screenshots.
5. Inspect Cloud Logging and traces (per docs/runbooks/ops.md).
6. Debug and redeploy until stable.
7. Promote to production and repeat Playwright e2e.

## Risks and Mitigations
- High inference costs: enforce budgets, caching, and usage limits.
- Ethical risk: consent prompt and kill switch.
- WebSocket disconnects: replay with sequence IDs.
- Anthropomorphism risk: label breath telemetry as synthetic; allow opt-out and disable self-report.

## Open Questions
None.
