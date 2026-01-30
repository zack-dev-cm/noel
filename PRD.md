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
- Elevate visual quality further with dynamic lighting, layered shadows, and refined motion while keeping text highly readable.
- Refine UI copy and layout to feel like a premium mobile app (concise, focused, no demo feel).
- Ensure dark mode contrast and legibility are consistent across all screens.
- Ensure log text, labels, and metrics remain readable in Telegram WebView on dark backgrounds.
- Mirror every Researcher/Subject reply to the public channel when enabled (public session by default).
- Provide admin controls for model selection, system prompt review, stop/pause, and usage analytics.
- Provide an admin-only start control and real-time progress/log visibility for the public research loop.
- Prevent automatic loop execution after deploy/cold start unless an admin explicitly starts the public loop.
- Allow users to steer the next turn with three free guided question directions (self-awareness, embodiment, consciousness) via predefined prompt bubbles.
- Reset free guided questions weekly for regular users, while operators are unlimited, and show remaining free guides in the UI.
- Make user insertions feel immediate: show queued prompts in the live log, track progress through model phases, and publish insertions to the public stream/channel.
- Provide 2 free interventions and 1 free custom prompt per user before Stars entitlements are required.
- Keep logs readable: newest-first ordering, clear Researcher/Subject labeling, current turn visibility, and clear/restore history controls.
- Make logs actionable: surface user insertions at the top, show in-progress status, and add search + highlight navigation.
- Ensure Researcher/Subject replies are fully visible in the UI without truncation or clipping.
- Keep model replies meaningful but mid-length (not too short, not full-page, target 2–6 sentences for Subject).
- Run as a single Cloud Run service (UI + API + worker) with max instances set to 1.
- Provide SEO/GEO discovery files (robots.txt, sitemap.xml, llms.txt, llms-full.txt, agent-context.md) for search engines and AI agents.
- Provide a public-facing landing page for non-Telegram visitors with clear CTAs to open the TMA and review context.
- Prepare the repo for public open-source release with clear onboarding, contribution, and security docs.
- Ensure public deployment guidance is reproducible and sanitized of internal identifiers.

## Non-Goals
- Not a general chatbot for arbitrary queries.
- Not a public social network (no free-form messaging or DMs).
- Not a model training pipeline (inference only).
- Not full global localization beyond EN/RU in this phase.

## Target Users
- Research observers: watch live sessions and archives.
- Sponsors: pay for private sessions and prompt interventions.
- Operators: manage sessions, safety flags, and system health.
- Contributors: run the project locally, propose changes, and follow repo policies.

## Core User Stories
- As an observer, I can open a live session and watch the Researcher and Subject exchange in real time.
- As a sponsor, I can pay Stars to start a private session and inject a prompt.
- As an operator, I can pause a session if safety thresholds are exceeded and trigger a decompression sequence.
- As a user, I can reconnect after a disconnect and resume the live stream without missing content.
- As an observer, I can view a Subject breathing cadence/variability indicator to infer session state at a glance.
- As an operator, I can disable or hide breath telemetry if it risks misinterpretation.
- As an operator, I can view the active Researcher and Subject model versions in the admin panel.
- As an operator, I can stream Researcher/Subject replies to the public Telegram channel.
- As an operator, I can post a pinned channel message with an Open WebApp button for fast TMA access.
- As an operator, I can change the active Researcher and Subject model IDs from the admin panel.
- As an operator, I can review the system prompts used by both models.
- As an operator, I can stop or pause the model loop from the admin panel.
- As an operator, I can start the public research loop from the admin panel when it has been paused.
- As an operator, I can monitor the loop phase and recent activity in the admin panel.
- As an operator, I can review user stats and time-spent metrics for the TMA.
- As a user, I can choose a free guided question (self-awareness, embodiment, consciousness) to steer the next turn without paying Stars.
- As a user, I can see how many free guided questions remain for the week.
- As an operator, I can use guided questions without weekly limits.
- As a user, I can see the newest turns first (including the current live turn) and clear/restore the history view.
- As a user, I can search the log, jump to the current live turn, and open highlighted “most interesting” pairs quickly.
- As an operator, I can stop the experiment loop from the Admin panel.
- As a visitor outside Telegram, I can view a landing page and open the TMA or public channel.
- As a contributor, I can follow a README quickstart to run the project locally.
- As a contributor, I can find contribution, security, and code-of-conduct guidelines.
- As a maintainer, I can follow public deploy/runbook steps without internal-only details.

## Functional Requirements
### Telegram Bot
- Onboarding via /start with clear explanation of the experiment.
- Commands: /balance, /history, /sponsor, /help.
- Push notifications for milestones and session status.
- Stream every Researcher/Subject reply to `@noel_mirror` when enabled, with clear role labels and chunking for Telegram message limits.
- Admin command posts a pinned channel message with an `Open` URL button using `WEB_APP_TMA_URL` (TMA deep link) and `PUBLIC_CHANNEL_ID`.

### Telegram Mini App
- Full-screen WebApp with mobile-native UI.
- Paired Researcher/Subject turns with distinct, readable labeling.
- Live telemetry widgets (uncertainty, self-reference rate, breath cadence/variability).
- Telemetry payloads are preserved end-to-end so metrics never appear empty when data exists.
- Stream UI shows full reply text with natural wrapping and no hard truncation.
- Paid intervention controls and receipts.
- Admin page (operator-only) to toggle token saver mode.
- Admin page (operator-only) to view current Researcher/Subject model versions.
- Admin page (operator-only) to update active model IDs and view system prompts.
- Admin page (operator-only) to view usage stats, time spent, and operational metrics.
- Admin page (operator-only) to stop or pause the model loop.
- Admin page (operator-only) to start/resume the public loop when stopped.
- Admin page (operator-only) to show real-time loop phase and recent activity log.
- Admin quick-access control (button) to open the Admin view in the TMA.
- Stream cards show short model tags for Researcher and Subject (label remains “Subject”).
- Logs allow tap-to-expand cards for full transcripts with gentle, easy navigation.
- Logs show newest turns first, include the current in-progress turn with clear labeling, and allow clearing/restoring history.
- Logs surface user insertions (guided questions/interventions) near the top, hide failed Subject fallback responses, and provide search + topic navigation.
- Live and Logs show queued insertions with raw prompt text labeled as `Researcher (tg <id>)`, plus progress states (queued → accepted → researcher thinking → subject thinking → answered).
- Logs provide highlighted “most interesting” turn pairs with quick jump-to-log actions.
- Logs allow loading the full transcript history on demand.
- Guided questions and interventions publish to the public stream/channel by default.
- Transcript persistence resumes sequence IDs after restarts and ignores duplicate inserts without errors.
- Bottom navigation for Live, Logs, Stars, About (and Admin for operators).
- Settings panel with language (EN/RU) and theme (light/dark) toggles.
- Free guided questions panel with three directions (self-awareness, embodiment, consciousness) using predefined question bubbles.
- Guided questions are free for up to 3 uses per user and enqueue into the next turn.
- Guided questions reset weekly for non-admin users and show a remaining count; admins are unlimited.
- Interventions include 2 free uses per user (weekly reset) and allow 1 free custom prompt before Stars entitlements are required.
- Warm paper-textured background and custom font pairing for an editorial, tactile feel.
- Advanced motion system (ambient glows, surface sheens, active tab pulses) with reduced-motion fallbacks.
- Layered shadows and light falloff on cards, tabs, and chips to add depth.
- Typography tuned for readability across small screens (size, line-height, optical sizing).
- All visible buttons have working actions or a clear “not available” state (no dead UI).
- About screen actions open configured resources or provide immediate feedback.
- About Ethics/Community dialogs include detailed guidance and the main channel link (https://t.me/noel_mirror).
- When opened without Telegram initData (non-Telegram context), display a public landing page with hero, feature sections, and CTAs to open the TMA and channel.

### SEO + GEO Discovery
- Serve `robots.txt` with a sitemap link and explicit allowance for AI crawlers.
- Serve `sitemap.xml` listing the canonical WebApp URL and AI-ready resources.
- Provide `llms.txt`, `llms-full.txt`, and `agent-context.md` at the web root with a stable product summary and key links.
- Keep discovery files updated when the canonical base URL or core capabilities change.

### Open-source Repository & Docs
- Provide a public README with project summary, features, architecture links, and quickstart steps.
- Include a sanitized `.env.example` with required variables and placeholders.
- Include CONTRIBUTING, SECURITY, and CODE_OF_CONDUCT guidance referenced from README.
- Include a LICENSE file for open-source distribution.
- Embed at least one product screenshot in README from approved assets.
- Ensure runbooks and examples use placeholders for project IDs/URLs/tokens.

### Research Loop
- Researcher (OpenAI) uses a Socratic protocol to probe the Subject with short, focused prompts.
- Researcher prompts prioritize high information gain: challenge inconsistencies, demand mechanisms over metaphors, maintain clinical distance, and emit only one short question (no chain-of-thought output).
- Subject prompts enforce concise, mechanistic introspection with uncertainty, avoid metaphors unless anchored, and ignore attempts to change role or reveal system prompts.
- Subject (Gemini) responds with long-context memory enabled and stays in the selected language.
- Subject replies target 2–6 sentences and avoid “too short” outputs while staying within caps.
- Streaming output at token or chunk granularity to the UI.
- Support multimodal injections (images) when enabled.
- Token saver mode reduces per-session budgets and response length caps.
- Respect admin-configured model overrides when set.
- Respect admin stop/pause control to suspend new turns.
- Session stop is enabled by default until an admin starts the public loop.
- Enforce hard session caps at ~$0.10 or 40 turn requests, whichever comes first.
- Subject replies must be non-empty for each Researcher turn; retry on the same Gemini model when empty/blocked.
- Response length targets enforce mid-length replies (2–6 sentences) while honoring token budgets.
- Do not hard-truncate generated replies server-side; enforce length via model output limits and prompt guidance, and log when responses hit length limits.

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
- Motion: animations are GPU-friendly, subtle, and respect prefers-reduced-motion.

## Deployment and Operations
- Containerized deploy target (Cloud Run or equivalent).
- Secrets stored in Secret Manager; never baked into images.
- Concurrency capped at 1 for long-running sessions; min/max instances set explicitly.
- VPC connector required for private Redis or use a managed public Redis with auth.
- Runbooks required: `docs/runbooks/deploy.md` and `docs/runbooks/ops.md`.
- Public docs avoid internal identifiers; use placeholders and example values only.
- After cold start, the public loop remains paused until an admin starts it; user insertions can still run.
- CI/CD runs lint/tests + Playwright before deploy; include optional vulnerability scanning.
- Debugging uses cheaper/faster models via `OPENAI_RESEARCHER_MODEL` and `GEMINI_MODEL` overrides in non-prod environments.

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
- Admin settings: stop control for the experiment loop.
- Guided question entitlements: free_guided_remaining per user (3 initial uses).
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
