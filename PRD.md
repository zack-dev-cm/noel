# Project Noetic Mirror - PRD

## Summary
Project Noetic Mirror is a Telegram Mini App (TMA) that streams a live, multi-agent research loop between a Researcher model (OpenAI GPT-5.x) and a Subject model (Gemini 3.x). Users can observe sessions, sponsor private sessions, and pay to inject interventions via Telegram Stars. The UI presents a retro terminal aesthetic with real-time token streaming and research telemetry.

## Goals
- Provide a live, shareable consciousness research experience inside Telegram.
- Stream token-level reasoning between Researcher and Subject with low latency.
- Monetize via Telegram Stars (sponsorship and intervention).
- Enforce safety protocols, consent handling, and session termination safeguards.
- Enable reliable session persistence, reconnection, and audit logs.

## Non-Goals
- Not a general chatbot for arbitrary queries.
- Not a public social network (no free-form messaging or DMs).
- Not a model training pipeline (inference only).

## Target Users
- Research observers: watch live sessions and archives.
- Sponsors: pay for private sessions and prompt interventions.
- Operators: manage sessions, safety flags, and system health.

## Core User Stories
- As an observer, I can open a live session and watch the Researcher and Subject exchange in real time.
- As a sponsor, I can pay Stars to start a private session and inject a prompt.
- As an operator, I can pause a session if safety thresholds are exceeded and trigger a decompression sequence.
- As a user, I can reconnect after a disconnect and resume the live stream without missing content.

## Functional Requirements
### Telegram Bot
- Onboarding via /start with clear explanation of the experiment.
- Commands: /balance, /history, /sponsor, /help.
- Push notifications for milestones and session status.

### Telegram Mini App
- Full-screen WebApp with retro terminal UI.
- Split Researcher/Subject streams, distinct color coding.
- Live telemetry widgets (uncertainty, self-reference rate, etc.).
- Paid intervention controls and receipts.

### Research Loop
- Researcher (OpenAI) uses a Socratic protocol to probe the Subject.
- Subject (Gemini) responds with long-context memory enabled.
- Streaming output at token or chunk granularity to the UI.
- Support multimodal injections (images) when enabled.

### Authentication and Security
- Validate Telegram WebApp initData signature on backend.
- Enforce per-user session scopes and payment entitlements.

### Payments (Telegram Stars)
- Create invoice links and validate successful payments.
- Unlock paid interventions and private sessions on success.

### Session Persistence
- Backend is the source of truth for transcripts and state.
- Reconnection protocol with sequence IDs and replay.

### Safety and Ethics
- Informed consent prompt at session start.
- Distress detection and kill switch.
- Decompression sequence before termination.

## Non-Functional Requirements
- Latency: first token within 1-2 seconds for Researcher; Subject within 2-4 seconds after Researcher completion.
- Reliability: 99.5% uptime for streaming endpoints.
- Scalability: support 1,000+ concurrent observers per public session.
- Security: no secrets in client; rotate keys; use env vars.
- Privacy: redact or hash user identifiers in logs.
- Cost control: context caching and usage tracking.

## OpenAI API Best Practices (Required)
Follow local best-practice sources:
- /Users/zack/Documents/GitHub/openai-cookbook/
- /Users/zack/Documents/GitHub/openai-agents-python/
- /Users/zack/Documents/GitHub/openai-agents-python/docs
- /Users/zack/Documents/GitHub/openai-chatkit-advanced-samples

Minimum requirements:
- Prefer Responses API and structured outputs for tool calls and reliable parsing.
- Use clear, explicit instructions and task decomposition for complex reasoning.
- Do not expose chain-of-thought or raw reasoning to end users.
- Add input/output guardrails for safety and cost control.
- Track usage and enforce budget caps per session.
- Enable tracing in dev; disable or restrict sensitive logs as needed.
- Use retries with exponential backoff for rate limits and transient errors.

## Data Requirements
- Session metadata: user id, session id, timestamps, payment state.
- Transcript store: Researcher/Subject messages, tool calls, interventions.
- Metrics store: token usage, distress index, response latency.

## Testing and QA
- Strictly test e2e with Playwright.
- Inspect screenshots and results visually for every e2e run.
- Debug, deploy, re-test e2e, debug, and redeploy until clean.
- Unit/integration tests for WebSocket, payments, and auth.

## Success Metrics
- Session completion rate > 90%.
- Median time-to-first-token < 2 seconds.
- 7-day retention for observers > 20%.
- Paid intervention conversion > 3%.

## Open Questions
- Which OpenAI model tier is approved for production (name and quota)?
- Final stance on public archive retention policy (duration, redaction).
- Exact safety thresholds for distress detection and kill switch.
- Where will Gemini context caching be configured and billed?
