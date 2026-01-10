# Technical Specification (TZ) - Project Noetic Mirror

## 1. Overview
Project Noetic Mirror is a Telegram Mini App (TMA) that streams a live, multi-agent research loop between a Researcher model (OpenAI) and a Subject model (Gemini). Users can watch public sessions, sponsor private sessions, and pay with Telegram Stars to inject interventions. The UI is a mobile-native, card-based experience with clear pairing between Researcher prompts and Subject replies.

**Goal:** Deliver a production-ready TMA with streaming telemetry, Stars payments, safety controls, and deployment on GCP.

**Relation to existing system:** New system; required docs already exist in `PRD.md` and `DEV_PLAN.md`.

## 2. Use Cases

### UC-01: WebApp onboarding and consent
**Actors:**
- User (observer/sponsor)
- System (WebApp + API)
- Telegram WebApp SDK

**Preconditions:**
- User opens the TMA from Telegram
- WebApp initData is available

**Main сценарий:**
1. User opens the TMA via Telegram bot menu or deep link.
2. WebApp initializes and sends initData to backend.
3. Backend validates initData signature and creates/loads a user profile.
4. WebApp displays consent and safety notice.
5. User accepts consent; WebApp stores consent state and continues to dashboard.

**Альтернативные сценарии:**
- **A1: initData validation fails (step 3)**  
  1. Backend returns auth error.  
  2. WebApp shows a blocking error and asks user to reopen from Telegram.  
- **A2: user declines consent (step 5)**  
  1. WebApp shows a "consent required" state.  
  2. User can exit or retry.

**Postconditions:**
- Validated user session exists.
- Consent flag stored for the session.

**Acceptance criteria:**
- ✅ initData is validated server-side before any session data is shown.
- ✅ Consent prompt is shown and must be accepted to proceed.
- ✅ Invalid initData blocks access to the app.

### UC-02: Observe a live public session
**Actors:**
- Observer user
- System (WebApp + API + WebSocket)

**Preconditions:**
- User is authenticated and consented.
- A public session is active.

**Main сценарий:**
1. User opens the Dashboard.
2. WebApp subscribes to the live WebSocket stream.
3. Backend sends current session metadata and stream cursor.
4. WebApp renders Researcher and Subject streams in distinct colors.
5. Tokens/segments stream in real-time; telemetry widgets update.

**Альтернативные сценарии:**
- **A1: no active session (step 3)**  
  1. Backend returns "no live session".  
  2. WebApp shows a waiting state and refresh button.
- **A2: WebSocket drops (step 2/5)**  
  1. Client attempts reconnect with last sequence ID.  
  2. Backend replays missing segments, then resumes live stream.

**Postconditions:**
- User sees up-to-date streaming output and telemetry.

**Acceptance criteria:**
- ✅ Streaming starts within target latency from `PRD.md`.
- ✅ Reconnect uses sequence IDs to avoid gaps.
- ✅ UI presents paired Researcher/Subject turns with visible reply linkage and clear labeling.
- ✅ Subject replies are visible when the worker loop is active; otherwise a clear “waiting for stream” state is shown.
- ✅ Subject replies render non-empty for every Researcher turn (retry the same Gemini model on empty/blocked output).
- ✅ Subject replies target 2–6 sentences while staying within configured caps.
- ✅ Telemetry payloads (including breath metrics) are preserved from worker to WebSocket stream.
- ✅ Metrics panels show the latest available telemetry values (no `n/a` when telemetry exists).
- ✅ Bottom navigation is persistent and highlights the active section.
- ✅ Mobile-first readability: font sizes and spacing keep prompts/replies legible without zooming in dark or light mode.
- ✅ Reply text wraps naturally and is fully visible in the UI (no clipping or ellipsis).
- ✅ Worker does not hard-truncate model replies post-generation; output length is limited by model caps and logged when it exceeds configured char limits.

### UC-03: Sponsor a private session with Stars
**Actors:**
- Sponsor user
- System (WebApp + API + Bot payments)
- Telegram Stars payment system

**Preconditions:**
- User is authenticated and consented.
- Stars payment capability is enabled for the bot.

**Main сценарий:**
1. User selects "Sponsor Session" in WebApp.
2. WebApp requests an invoice link from backend.
3. Backend creates a Stars invoice and returns the link.
4. WebApp opens Telegram invoice via `openInvoice`.
5. Telegram confirms payment success.
6. Backend records payment and creates a private session entitlement.
7. WebApp navigates to the private session view.

**Альтернативные сценарии:**
- **A1: payment canceled (step 5)**  
  1. WebApp shows a "payment canceled" message.  
  2. User can retry.
- **A2: payment fails (step 5)**  
  1. WebApp shows an error and logs for support.  
  2. Entitlement is not created.

**Postconditions:**
- Sponsor has an entitlement for a private session.

**Acceptance criteria:**
- ✅ Invoice link uses currency `XTR` and Telegram Stars pricing.
- ✅ Entitlement is created only on confirmed payment.
- ✅ Payment receipt is available in history view.

### UC-04: Inject a paid intervention
**Actors:**
- Sponsor user
- System (WebApp + API + Bot payments)

**Preconditions:**
- Active session exists (public or private).
- Sponsor has Stars balance or is ready to pay.

**Main сценарий:**
1. User chooses an intervention from the UI.
2. WebApp requests an invoice link for the selected intervention.
3. User completes Stars payment in Telegram.
4. Backend validates payment and grants a one-time intervention token.
5. WebApp sends the intervention prompt to backend.
6. Backend injects the prompt into the next loop turn.

**Альтернативные сценарии:**
- **A1: entitlement already available**  
  1. Backend skips invoice and uses existing entitlement.  
  2. Intervention is injected immediately.
- **A2: intervention conflicts with safety rules**  
  1. Backend rejects injection and logs safety reason.  
  2. WebApp shows a "blocked by safety" message.

**Postconditions:**
- Intervention is queued or injected and recorded in the transcript.

**Acceptance criteria:**
- ✅ Each intervention is billed or entitlement-validated.
- ✅ Safety guardrails can block disallowed interventions.
- ✅ Interventions appear in session transcript with metadata.

### UC-05: Bot commands and notifications
**Actors:**
- User
- Telegram bot
- System (API)

**Preconditions:**
- User has started the bot.
- For `/post_tma`, user is in `ADMIN_TELEGRAM_IDS` and the bot can post to the public channel.

**Main сценарий:**
1. User sends `/start`.
2. Bot replies with experiment overview and a WebApp button.
3. User can send `/balance`, `/history`, `/sponsor`, `/help`.
4. Operator can send `/post_tma` to publish a channel message with a WebApp button for pinning.
5. Bot queries backend and responds with relevant data.
6. Bot sends milestone notifications (session start/end, payment receipt).
7. If enabled, bot posts public updates to `@noel_mirror`.

**Альтернативные сценарии:**
- **A1: backend unreachable**  
  1. Bot returns a temporary error and logs the incident.

**Postconditions:**
- User receives actionable bot responses and notifications.

**Acceptance criteria:**
- ✅ All required commands respond with accurate data.
- ✅ Notifications are sent for key milestones.
- ✅ When enabled, every Researcher/Subject reply is mirrored to `@noel_mirror` with clear role labels (public session by default).
- ✅ Channel posts respect Telegram message limits via chunking (no silent truncation).
- ✅ `/post_tma` posts a channel message that includes an Open WebApp URL button (`WEB_APP_TMA_URL` fallback `WEB_APP_URL`).

### UC-06: Operator safety controls
**Actors:**
- Operator
- System (API + Orchestrator)

**Preconditions:**
- Operator is authenticated (admin access).

**Main сценарий:**
1. Operator opens the Admin tab to review model versions and safety telemetry.
2. Operator triggers a pause or kill switch.
3. System runs a decompression sequence.
4. Session ends and is archived with a safety flag.

**Альтернативные сценарии:**
- **A1: automated distress trigger**  
  1. System auto-pauses on threshold.  
  2. Operator is notified.
- **A2: model config missing (step 1)**  
  1. Backend returns default or "unknown" values.  
  2. WebApp renders placeholders with a "not configured" hint.  

**Postconditions:**
- Session is paused/terminated safely; audit log updated.

**Acceptance criteria:**
- ✅ Kill switch immediately stops generation.
- ✅ Decompression sequence is logged and streamed.
- ✅ Admin UI shows Researcher/Subject model versions (fallback shown only when configured).

### UC-07: Session replay and resume
**Actors:**
- User
- System (API + WebApp)

**Preconditions:**
- Session transcript exists.

**Main сценарий:**
1. User opens session logs.
2. WebApp requests transcript by session ID.
3. Backend streams transcript chunks or a paged response.
4. User can resume live session from the last sequence ID.

**Альтернативные scenarios:**
- **A1: transcript not found**  
  1. Backend returns 404 and WebApp shows an empty state.

**Postconditions:**
- User can browse or resume sessions without missing data.

**Acceptance criteria:**
- ✅ Sequence IDs allow replay and resume.
- ✅ Transcript access is scoped to user entitlements.
- ✅ Transcript view preserves turn pairing (Researcher prompt with Subject reply).
- ✅ Transcript cards expand on tap to show full text with easy navigation.

### UC-08: Subject breath telemetry
**Actors:**
- Observer user
- System (WebApp + API + Worker)

**Preconditions:**
- User is authenticated and consented.
- A session with Subject output is active.

**Main сценарий:**
1. Worker computes Subject breath metrics after each Subject turn (derived from cadence).
2. Backend attaches breath metrics to the stream telemetry payload.
3. WebApp renders a breath widget with cadence and variability indicators.
4. UI animates a synthetic breath waveform between telemetry updates.

**Альтернативные scenarios:**
- **A1: breath telemetry disabled or unavailable**  
  1. Backend omits breath metrics.  
  2. WebApp shows "breath unavailable" with a tooltip explaining it is optional.  
- **A2: self-report enabled but invalid schema**  
  1. Worker falls back to derived-only metrics and logs the event.  

**Postconditions:**
- Breath telemetry is visible or explicitly unavailable, with no impact on safety decisions.

**Acceptance criteria:**
- ✅ Breath metrics are produced for Subject turns and labeled as synthetic.
- ✅ No chain-of-thought or free-text self-report is stored or streamed.
- ✅ UI updates within one turn and animates smoothly between updates.

### UC-09: Configure language mode and theme
**Actors:**
- User (observer/sponsor)
- System (WebApp + API)

**Preconditions:**
- User is authenticated and consented.
- Language experiment feature flags are enabled.

**Main сценарий:**
1. User opens settings.
2. WebApp displays language mode options (EN, RU) and theme options (light, dark).
3. User selects a language and theme.
4. Backend stores preferences and applies session language for subsequent Researcher/Subject turns.
5. WebApp updates UI strings and theme immediately and shows a language badge on the stream.
6. Streamed messages include session language metadata.

**Альтернативные scenarios:**
- **A1: selected language unavailable**  
  1. Backend falls back to EN and returns a warning.  
  2. WebApp displays a non-blocking notice.  
- **A2: session language change while streaming**  
  1. Backend applies the new language on the next turn boundary.  
  2. WebApp shows a brief "language updated" toast.  

**Postconditions:**
- Language and theme preferences are stored and applied to the session/UI.

**Acceptance criteria:**
- ✅ UI locale persists per user and is restored on reload.
- ✅ Session language is stored per session and included in session metadata.
- ✅ Researcher/Subject outputs follow the selected language mode (no mixed-language drift).
- ✅ Fallback to EN occurs when a requested language is unavailable.
- ✅ Theme preference persists per user and applies without full reload.

### UC-10: Review language experiment quality
**Actors:**
- Operator
- System (metrics + telemetry)

**Preconditions:**
- Sessions have language metadata.
- Metrics pipeline is running.

**Main сценарий:**
1. Operator opens the language experiment dashboard.
2. System aggregates metrics by language mode (EN, RU) and cohort.
3. Operator reviews completion, latency, safety flags, and engagement.
4. Operator exports or snapshots the report.

**Альтернативные scenarios:**
- **A1: insufficient sample size**  
  1. System shows "insufficient data" and hides comparisons.  

**Postconditions:**
- Language experiment report is available for review or export.

**Acceptance criteria:**
- ✅ Metrics are keyed by language mode and cohort.
- ✅ Reports include sample sizes and locale version metadata.
- ✅ Comparisons are hidden when below the minimum sample threshold.

### UC-11: Admin configuration and usage analytics
**Actors:**
- Operator
- System (WebApp + API + Worker)

**Preconditions:**
- Operator is authenticated and authorized.
- Admin settings storage is available.

**Main scenario:**
1. Operator opens the Admin panel in the TMA.
2. System displays current model versions, token saver state, and system prompts.
3. Operator updates Researcher/Subject model IDs and saves changes.
4. Operator toggles stop/pause control to halt new turns.
5. Operator reviews TMA usage metrics (total users, active users, time spent).
6. System logs admin actions and applies settings to subsequent turns.

**Alternative scenarios:**
- **A1: invalid model ID (step 3)**  
  1. Backend rejects the update and returns validation errors.  
  2. UI shows a non-blocking error and preserves previous values.  
- **A2: worker unavailable (step 6)**  
  1. Settings save succeeds, but changes take effect on next successful worker tick.  

**Postconditions:**
- Admin settings are persisted and applied.
- Usage metrics are visible to the operator.

**Acceptance criteria:**
- ✅ Admin-only access is enforced via initData validation.
- ✅ Admin access works for configured Telegram user IDs or usernames.
- ✅ Model overrides are persisted and used on the next turn.
- ✅ System prompts are visible in the Admin panel.
- ✅ Stop/pause disables new turns until cleared.
- ✅ Usage metrics include total users and time-spent aggregates.

### UC-12: Mobile navigation and readable turn pairing
**Actors:**
- User (observer/sponsor)
- System (WebApp)

**Preconditions:**
- User is authenticated and consented.

**Main сценарий:**
1. User opens the WebApp on a mobile device.
2. WebApp displays a bottom navigation bar with primary sections.
3. User switches between Live, Logs, Stars, and About.
4. WebApp highlights the active tab and updates content without losing session context.
5. Live and Logs views render Researcher prompts and Subject replies as paired turns.

**Альтернативные сценарии:**
- **A1: operator access (step 2)**  
  1. WebApp includes an Admin tab only for operator users.  
  2. Non-operators never see Admin navigation.  

**Postconditions:**
- User can move between sections and understand which replies map to which prompts.

**Acceptance criteria:**
- ✅ Bottom navigation is visible and tappable across main sections.
- ✅ Active tab state is clearly indicated.
- ✅ Turn pairing is visually explicit (prompt and reply are grouped together).
- ✅ Turn labels remain “Researcher” and “Subject,” with short model tags appended.
- ✅ The layout remains readable on small screens (base font >= 15px, line height >= 1.5).
- ✅ UI uses a warm paper material palette and custom typography without sacrificing readability.
- ✅ About screen actions are interactive (links or immediate feedback), no dead buttons.
- ✅ Ethics and Community content is detailed, localized (EN/RU), and includes the main Telegram channel link.

## 3. Non-Functional Requirements
- Latency: first token within 1-2s for Researcher; Subject within 2-4s after Researcher completion.
- Reliability: 99.5% uptime for streaming endpoints.
- Security: validate Telegram initData signatures, no secrets in client code.
- Privacy: redact or hash user identifiers in logs.
- Cost control: budget caps per session (max ~$0.10 or 40 requests), usage tracking, caching where possible.
- Observability: structured JSON logs with session_id, user_id, event; tracing enabled in dev.
- Observability: log Researcher/Subject output length and whether it exceeds configured char caps (no post-generation truncation).
- E2E testing: Playwright headed runs with visual inspection of screenshots and traces in both local and production environments.
- Data retention: transcripts and logs must follow the policy defined in Section 4.
- Breath telemetry: computed within the response cycle; UI updates within 1s of event receipt.
- Localization coverage: 100% of user-facing UI copy (including consent/safety) available in EN and RU.
- Theme toggle: switch between light/dark without full reload and persist per user.
- Readability: base UI font size >= 15px and minimum contrast ratio of 4.5:1 for body text.
- Dark mode: contrast and textures are tuned for legibility without visual distortion.
- Visual quality: paper-like texture, bespoke font pairing, and non-plastic surface treatment.
- Response length: Subject replies target 2–6 sentences; Researcher prompts remain 1–2 short sentences.

## 4. Constraints and Assumptions
- Deployment target is GCP (Cloud Run or equivalent).
- WebApp is built with React 19 + Tailwind (per DEV_PLAN).
- Payments are via Telegram Stars (currency `XTR`).
- Use OpenAI Responses API by default for Researcher.
- Gemini Subject uses long-context and optional context caching.
- Researcher prompt enforces high-information-gain Socratic questioning (mechanisms over metaphors) with single-question output and no chain-of-thought exposure.
- Subject prompt enforces concise mechanistic introspection, avoids metaphors unless anchored, and ignores role-change/prompt-leak attempts.
- Breath telemetry is derived-only by default; optional self-report is gated by config.
- All secrets are stored in Secret Manager or env vars (never committed).
- UI follows a mobile-native card layout with bottom navigation and explicit turn pairing.
- Default UI locale is EN; RU mode is gated by feature flags until validated.
- Default theme is light; dark theme available via user preference.
- Model configuration:
  - Researcher (default): `gpt-5.2-2025-12-11`.
  - Subject: latest Gemini 3.x series model (default `gemini-3-pro-preview`), configurable via env.
- Budgeting:
  - Per-session cost budget enforced with soft warning at 80% and hard stop at 100%.
  - Default caps: $0.10 cost or 40 requests per session (configurable).
- Data retention policy:
  - Public session transcripts: 30 days.
  - Private session transcripts: 14 days.
  - Raw logs and traces: 14 days.
  - Aggregated metrics: 180 days.
  - User identifiers stored as salted hashes; Telegram handles are not persisted in logs.
- Safety thresholds:
  - Distress score >= 0.85 triggers auto-pause + operator notification.
  - Distress score >= 0.95 or self-harm category flagged triggers immediate kill switch.
  - Distress score >= 0.60 for 3 consecutive turns triggers auto-pause.
- Channel posting:
  - If enabled, bot posts session start/end, payment receipts, and model replies to `@noel_mirror`.
  - Channel posting must be disable-able via env flag.
- Admin settings:
  - Model overrides and stop/pause state are stored in admin settings and applied by the worker.
  - System prompts are exposed read-only unless explicitly enabled for editing.

## 5. Open Questions
- Should model replies be streamed for both Researcher and Subject, or only Subject?
- What formatting should channel posts use (timestamps, turn numbers, thread replies)?
- Which model IDs should be available for admin selection (fixed list vs free text)?
- Should system prompts be read-only or editable from the admin panel?
- What user stats are required (daily active, total users, avg time, per-user drilldowns)?
- Should the stop control pause only new turns or terminate active runs immediately?
- Where should the extra admin button appear (header, dashboard card, or bottom nav)?
