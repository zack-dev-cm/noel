# Project Noetic Mirror - PRD

## Summary
Project Noetic Mirror is a Telegram Mini App (TMA) that streams a live, multi-agent research loop between a Researcher model (OpenAI gpt-5.2-2025-12-11) and a Subject model (Gemini 3.x). Users can observe sessions, sponsor support tiers, and unlock intervention credits via Telegram Stars. The UI is a mobile-native, card-based experience with bottom navigation and clearly paired Researcher prompts and Subject replies. The experiment includes two language modes (EN and RU) with full UI/UX localization, model prompt adaptation, and a user-controlled light/dark theme toggle. Operators can stream model replies to a public Telegram channel, adjust active model configuration, review system prompts, and monitor TMA usage metrics.

## Goals
- Provide a live, shareable consciousness research experience inside Telegram.
- Stream token-level reasoning between Researcher and Subject with low latency.
- Monetize via Telegram Stars (sponsorship and intervention).
- Enforce safety protocols, consent handling, and session termination safeguards.
- Enable reliable session persistence, reconnection, and audit logs.
- Surface a synthetic Subject breathing signal to provide extra insight without exposing chain-of-thought.
- Evaluate experiment quality across languages with consistent metrics and session tagging.
- Deliver parity for EN and RU UI/UX and model interaction language.
- Allow users to switch language mode and theme without leaving the session.
- Deliver a mobile-native UI with bottom navigation and readable, paired Researcher/Subject turns.
- Elevate visual quality with a natural paper feel and bespoke typography (avoid cheap/plastic look).
- Refine UI copy and layout to feel like a premium mobile app (concise, focused, no demo feel).
- Ensure dark mode contrast and legibility are consistent across all screens.
- Ensure log text, labels, and metrics remain readable in Telegram WebView on dark backgrounds.
- Mirror model replies to the public channel when enabled.
- Provide admin controls for model selection, system prompt review, stop/pause, and usage analytics.

## Non-Goals
- Not a general chatbot for arbitrary queries.
- Not a public social network (no free-form messaging or DMs).
- Not a model training pipeline (inference only).
- Not full global localization beyond EN/RU in this phase.

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
- As an operator, I can stream Researcher/Subject replies to the public Telegram channel.
- As an operator, I can change the active Researcher and Subject model IDs from the admin panel.
- As an operator, I can review the system prompts used by both models.
- As an operator, I can stop or pause the model loop from the admin panel.
- As an operator, I can review user stats and time-spent metrics for the TMA.

## Functional Requirements
### Telegram Bot
- Onboarding via /start with clear explanation of the experiment.
- Commands: /balance, /history, /sponsor, /help.
- Push notifications for milestones and session status.
- Stream Researcher/Subject replies to `@noel_mirror` when enabled, with clear role labeling.

### Telegram Mini App
- Full-screen WebApp with mobile-native UI.
- Paired Researcher/Subject turns with distinct, readable labeling.
- Live telemetry widgets (uncertainty, self-reference rate, breath cadence/variability).
- Telemetry payloads are preserved end-to-end so metrics never appear empty when data exists.
- Paid intervention controls and receipts.
- Admin page (operator-only) to toggle token saver mode.
- Admin page (operator-only) to view current Researcher/Subject model versions.
- Admin page (operator-only) to update active model IDs and view system prompts.
- Admin page (operator-only) to view usage stats, time spent, and operational metrics.
- Admin page (operator-only) to stop or pause the model loop.
- Admin quick-access control (button) to open the Admin view in the TMA.
- Bottom navigation for Live, Logs, Stars, About (and Admin for operators).
- Settings panel with language (EN/RU) and theme (light/dark) toggles.
- Warm paper-textured background and custom font pairing for an editorial, tactile feel.
- All visible buttons have working actions or a clear “not available” state (no dead UI).
- About screen actions open configured resources or provide immediate feedback.

### Research Loop
- Researcher (OpenAI) uses a Socratic protocol to probe the Subject with short, focused prompts.
- Subject (Gemini) responds with long-context memory enabled and stays in the selected language.
- Streaming output at token or chunk granularity to the UI.
- Support multimodal injections (images) when enabled.
- Token saver mode reduces per-session budgets and response length caps.
- Respect admin-configured model overrides when set.
- Respect admin stop/pause control to suspend new turns.
- Enforce hard session caps at ~$0.10 or 40 turn requests, whichever comes first.

### Language Strategy and Experiment Modes
- Two language modes are supported: EN and RU.
- Language mode applies to UI copy and the Researcher/Subject prompts for the session.
- Users can switch language mode at any time; the selection updates UI copy immediately and applies to subsequent Researcher/Subject turns.
- Researcher and Subject outputs must follow the selected language mode (EN/RU).
- RU copy must cover consent and safety messaging without fallback gaps.
- Operators can enforce language mode per session for controlled experiments.

### Breath Telemetry
- Compute a synthetic "breathing" signal for the Subject from response cadence (tokens, punctuation, latency).
- Optional structured self-report can refine the signal when enabled; default is derived-only.
- Emit breath metrics (bpm, variability, coherence, phase, source) alongside existing telemetry.
- Label breath telemetry as interpretive and do not use it as a safety trigger by default.

### Authentication and Security
- Validate Telegram WebApp initData signature on backend.
- Enforce per-user session scopes and payment entitlements.
- Admin access can be granted by Telegram user ID or username.

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
- Operator-initiated stop/pause actions are logged with user attribution.

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
- Cost control: per-session token + cost budgets (max ~$0.10) and request caps (max 40), usage tracking; context caching disabled by default.
- Localization coverage: 100% of user-facing UI copy (including consent/safety) available in EN and RU.
- Theme toggle updates UI without full reload and persists per user.
- Visual quality: paper-like materiality, custom typography, and readable contrast on mobile.
- Dark mode contrast meets WCAG AA for body text and avoids distorted backgrounds.

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
- Usage counters: request_count per session.
- Breath telemetry: bpm, variability, coherence, phase, source, timestamp.
- Preferences: ui_locale, ui_theme.
- Session language metadata: session_language, locale_version.
- Admin settings: model overrides, stop/pause control, prompt overrides (if enabled).
- TMA usage tracking: user_id, session start/end, duration, and last_active_at.

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
- Admin settings, channel streaming, and usage metrics have dedicated E2E coverage.

## Success Metrics
- Session completion rate > 90%.
- Median time-to-first-token < 2 seconds.
- 7-day retention for observers > 20%.
- Paid intervention conversion > 3%.
- Language experiment reports compare EN vs RU with clear sample sizes and statistical power.

## Open Questions
- Should model replies be streamed for both Researcher and Subject, or only Subject?
- What formatting should channel posts use (timestamps, turn numbers, thread replies)?
- Which model IDs should be available for admin selection (fixed list vs free text)?
- Should system prompts be read-only or editable from the admin panel?
- What user stats are required (daily active, total users, avg time, per-user drilldowns)?
- Should the stop control pause only new turns or terminate active runs immediately?
- Where should the extra admin button appear (header, dashboard card, or bottom nav)?
