# Project Noetic Mirror - PRD

## Summary
Project Noetic Mirror is a Telegram Mini App (TMA) that streams a live, multi-agent research loop between a Researcher model (OpenAI GPT-5) and a Subject model (Gemini 3.x). Users can observe sessions, sponsor support tiers, and unlock intervention credits via Telegram Stars. The UI presents a retro terminal aesthetic with real-time token streaming and research telemetry, including a synthetic Subject "breathing" signal. The experiment includes a multilingual track to assess session quality across languages, with an RU-primary pilot and an agent-native interaction mode that is always translated for human viewers.

## Goals
- Provide a live, shareable consciousness research experience inside Telegram.
- Stream token-level reasoning between Researcher and Subject with low latency.
- Monetize via Telegram Stars (sponsorship and intervention).
- Enforce safety protocols, consent handling, and session termination safeguards.
- Enable reliable session persistence, reconnection, and audit logs.
- Surface a synthetic Subject breathing signal to provide extra insight without exposing chain-of-thought.
- Evaluate experiment quality across languages with consistent metrics and session tagging.
- Pilot RU-primary UI and RU interaction language for Researcher/Subject when enabled.
- Explore an agent-native interaction mode with translated display and explicit labeling.

## Non-Goals
- Not a general chatbot for arbitrary queries.
- Not a public social network (no free-form messaging or DMs).
- Not a model training pipeline (inference only).
- Not full global localization beyond the experiment scope.
- Not exposing raw agent-native language to end users by default.

## Target Users
- Research observers: watch live sessions and archives.
- Sponsors: pay for private sessions and prompt interventions.
- Operators: manage sessions, safety flags, and system health.

## Core User Stories
- As an observer, I can open a live session and watch the Researcher and Subject exchange in real time.
- As a sponsor, I can pay Stars to start a private session and inject a prompt.
- As an operator, I can pause a session if safety thresholds are exceeded and trigger a decompression sequence.
- As a user, I can reconnect after a disconnect and resume the live stream without missing content.
- As an observer, I can view a Subject breathing cadence/variability indicator to infer session state at a glance.
- As an operator, I can disable or hide breath telemetry if it risks misinterpretation.
- As an operator, I can view the active Researcher and Subject model versions in the admin panel.

## Functional Requirements
### Telegram Bot
- Onboarding via /start with clear explanation of the experiment.
- Commands: /balance, /history, /sponsor, /help.
- Push notifications for milestones and session status.

### Telegram Mini App
- Full-screen WebApp with retro terminal UI.
- Split Researcher/Subject streams, distinct color coding.
- Live telemetry widgets (uncertainty, self-reference rate, breath cadence/variability).
- Paid intervention controls and receipts.
- Admin page (operator-only) to toggle token saver mode.
- Admin page (operator-only) to view current Researcher/Subject model versions.

### Research Loop
- Researcher (OpenAI) uses a Socratic protocol to probe the Subject.
- Subject (Gemini) responds with long-context memory enabled.
- Streaming output at token or chunk granularity to the UI.
- Support multimodal injections (images) when enabled.
- Token saver mode reduces per-session budgets and response length caps.

### Language Strategy and Experiment Modes
- UI supports locale selection (initially EN and RU) with per-user preference storage.
- Sessions define an interaction language for Researcher and Subject (EN, RU, or agent-native).
- RU-primary mode applies RU to UI copy and Researcher/Subject prompts when enabled; EN remains available as fallback.
- When session language differs from viewer display language, a translated display is shown with clear "translated" labeling.
- Agent-native mode keeps raw model output hidden from end users and always shows translated display text.
- Language mode and translation metadata are recorded per message for experiment analysis and audits.
- Operators can enforce language mode per session for controlled experiments.

### Breath Telemetry
- Compute a synthetic "breathing" signal for the Subject from response cadence (tokens, punctuation, latency).
- Optional structured self-report can refine the signal when enabled; default is derived-only.
- Emit breath metrics (bpm, variability, coherence, phase, source) alongside existing telemetry.
- Label breath telemetry as interpretive and do not use it as a safety trigger by default.

### Authentication and Security
- Validate Telegram WebApp initData signature on backend.
- Enforce per-user session scopes and payment entitlements.

### Payments (Telegram Stars)
- Create invoice links and validate successful payments.
- Stars tiers: Stargazer (10★), Cosmic Patron (100★, 1 intervention), Universal Architect (1000★, 5 interventions).
- Unlock paid interventions and private sessions on success (if enabled).

### Session Persistence
- Backend is the source of truth for transcripts and state.
- Reconnection protocol with sequence IDs and replay.

### Safety and Ethics
- Informed consent prompt at session start.
- Distress detection and kill switch.
- Decompression sequence before termination.
- Safety thresholds: kill at distress >= 0.95, pause at >= 0.85 or >= 0.60 for 3 consecutive turns.
- Breath telemetry is synthetic and must be labeled as such to avoid anthropomorphic claims.
- Agent-native outputs are never displayed raw; translated display is labeled as such to reduce misinterpretation.

### Image Generation (When Used)
- Use `OPENAI_IMAGE_MODEL` (default `gpt-image-1`) via `images.generate` with size 1024x1024.
- Prompts must avoid text/logos/UI and avoid identifiable faces; prefer editorial, high-contrast imagery.
- Decode `b64_json` responses, detect content type, and upload to object storage before storing URLs.
- If storage is unavailable or generation fails, log and proceed without blocking the session.

## Non-Functional Requirements
- Latency: first token within 1-2 seconds for Researcher; Subject within 2-4 seconds after Researcher completion.
- Reliability: 99.5% uptime for streaming endpoints.
- Scalability: support 1,000+ concurrent observers per public session.
- Security: no secrets in client; rotate keys; use env vars.
- Privacy: redact or hash user identifiers in logs.
- Cost control: per-session token + cost budgets, usage tracking; context caching disabled by default.
- Translation overhead: median added latency <= 1s per turn for translated display.

## Deployment and Operations
- Containerized deploy target (Cloud Run or equivalent).
- Secrets stored in Secret Manager; never baked into images.
- Concurrency capped at 1 for long-running sessions; min/max instances set explicitly.
- VPC connector required for private Redis or use a managed public Redis with auth.
- Runbooks required: `docs/runbooks/deploy.md` and `docs/runbooks/ops.md`.
- CI/CD runs lint/tests + Playwright before deploy; include optional vulnerability scanning.

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
- Sanitize untrusted text to reduce prompt-injection risk.
- Avoid sending sensitive data; redact where possible.

## Data Requirements
- Session metadata: user id, session id, timestamps, payment state.
- Transcript store: Researcher/Subject messages, tool calls, interventions.
- Metrics store: token usage, distress index, response latency.
- Breath telemetry: bpm, variability, coherence, phase, source, timestamp.
- Language metadata: ui_locale, session_language, display_language, translator_model, translation_version, translation_confidence.

## Retention and Redaction
- Public session transcripts: 30 days.
- Private session transcripts: 14 days.
- Telemetry + ops logs: 14 days.
- Logs store hashed user IDs; initData is never stored; transcript content is stored as-is.

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
- Language experiment reports show measurable differences in completion or engagement with clear statistical power.

## Open Questions
- Which languages beyond RU are in scope for the initial experiment phase (if any)?
- Does "RU as primary" mean a global default for all users, or an RU-locale default with EN still primary?
- Should Researcher and Subject always share the same interaction language, or can they diverge?
- In agent-native mode, should raw outputs be stored, and who can access them?
- What defines "experiment quality" for cross-language comparison (metrics and thresholds)?
