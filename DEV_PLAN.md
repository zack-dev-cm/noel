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

### M6: Observability and Ops
Deliverables:
- Tracing, structured logs, and metrics dashboard.

Tasks:
- OpenAI tracing and custom spans.
- Log redaction and secrets handling.

Acceptance:
- End-to-end traces visible in dev.

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

## Tooling and Stack
- Frontend: React 19 + Tailwind CSS (TMA).
- Backend: Node.js/Express or Go.
- Realtime: WebSocket (WSS).
- Storage: Postgres + Redis.
- Observability: OpenAI Traces + structured logs.

## Release Workflow (Strict)
1. Run Playwright e2e tests and inspect screenshots visually.
2. Debug any failures.
3. Deploy to staging.
4. Re-run Playwright e2e and inspect screenshots.
5. Debug and redeploy until stable.
6. Promote to production and repeat Playwright e2e.

## Risks and Mitigations
- High inference costs: enforce budgets, caching, and usage limits.
- Ethical risk: consent prompt and kill switch.
- WebSocket disconnects: replay with sequence IDs.

## Open Questions
- Final backend language choice (Node vs Go).
- Target hosting provider and deployment pipeline.
- Final model IDs and quotas.
