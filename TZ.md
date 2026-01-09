# Technical Specification (TZ) - Project Noetic Mirror

## 1. Overview
Project Noetic Mirror is a Telegram Mini App (TMA) that streams a live, multi-agent research loop between a Researcher model (OpenAI) and a Subject model (Gemini). Users can watch public sessions, sponsor private sessions, and pay with Telegram Stars to inject interventions. The UI is a retro terminal aesthetic based on the mock designs in `mocks.md` and the referenced images.

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
- ✅ UI matches mock layout: dual streams with distinct colors, stacked cards, bottom nav, telemetry widgets, and retro terminal styling per `mocks.md`.

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

**Main сценарий:**
1. User sends `/start`.
2. Bot replies with experiment overview and a WebApp button.
3. User can send `/balance`, `/history`, `/sponsor`, `/help`.
4. Bot queries backend and responds with relevant data.
5. Bot sends milestone notifications (session start/end, payment receipt).
6. If enabled, bot posts public updates to `@noel_mirror`.

**Альтернативные сценарии:**
- **A1: backend unreachable**  
  1. Bot returns a temporary error and logs the incident.

**Postconditions:**
- User receives actionable bot responses and notifications.

**Acceptance criteria:**
- ✅ All required commands respond with accurate data.
- ✅ Notifications are sent for key milestones.

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

### UC-09: Configure UI locale and session interaction language
**Actors:**
- User (observer/sponsor)
- System (WebApp + API)

**Preconditions:**
- User is authenticated and consented.
- Language experiment feature flags are enabled.

**Main сценарий:**
1. User opens settings before starting a session.
2. WebApp displays UI locale options (EN, RU) and session interaction language options (EN, RU, agent-native).
3. User selects options and confirms.
4. Backend stores settings and applies them to session configuration (UI copy and Researcher/Subject prompts).
5. WebApp updates UI strings and shows language badges on the stream.
6. Streamed messages include language and translation metadata.

**Альтернативные scenarios:**
- **A1: selected language unavailable**  
  1. Backend falls back to EN and returns a warning.  
  2. WebApp displays a non-blocking notice.  
- **A2: user changes display language mid-session**  
  1. Backend keeps session interaction language unchanged.  
  2. WebApp requests translated display for new locale.  

**Postconditions:**
- Language settings are stored and applied to the session.

**Acceptance criteria:**
- ✅ UI locale persists per user and is restored on reload.
- ✅ Session interaction language is stored per session and included in session metadata.
- ✅ Translated display is labeled whenever display language differs from session language.
- ✅ Fallback to EN occurs when a requested language is unavailable.

### UC-10: Agent-native interaction with translated display
**Actors:**
- Operator (or sponsor, if enabled)
- System (API + Orchestrator + Translation)
- Observer user

**Preconditions:**
- Agent-native mode is enabled by feature flag.
- Translation pipeline is available.

**Main сценарий:**
1. Operator enables agent-native mode for a session.
2. Backend configures Researcher/Subject to use an agent-native protocol for interaction.
3. Each model output is routed to translation before streaming to clients.
4. WebApp renders translated text with a "translated from agent-native" label.
5. System records translation metadata for each message.

**Альтернативные scenarios:**
- **A1: translation fails**  
  1. Backend sends a safe fallback message to clients.  
  2. Error is logged for investigation.  
- **A2: translated output fails safety checks**  
  1. Backend blocks the message and notifies the operator.  
  2. Session continues or pauses per safety policy.  

**Postconditions:**
- Observers see only translated content during agent-native sessions.

**Acceptance criteria:**
- ✅ Raw agent-native output is never displayed to end users.
- ✅ All translated messages include a translation label.
- ✅ Translation latency stays within NFR targets.


### UC-11: Review language experiment quality
**Actors:**
- Operator
- System (metrics + telemetry)

**Preconditions:**
- Sessions have language metadata.
- Metrics pipeline is running.

**Main сценарий:**
1. Operator opens the language experiment dashboard.
2. System aggregates metrics by language mode (EN, RU, agent-native) and cohort.
3. Operator reviews completion, latency, safety flags, and engagement.
4. Operator exports or snapshots the report.

**Альтернативные scenarios:**
- **A1: insufficient sample size**  
  1. System shows "insufficient data" and hides comparisons.  

**Postconditions:**
- Language experiment report is available for review or export.

**Acceptance criteria:**
- ✅ Metrics are keyed by language mode and cohort.
- ✅ Reports include sample sizes and translation version metadata.
- ✅ Comparisons are hidden when below the minimum sample threshold.

## 3. Non-Functional Requirements
- Latency: first token within 1-2s for Researcher; Subject within 2-4s after Researcher completion.
- Reliability: 99.5% uptime for streaming endpoints.
- Security: validate Telegram initData signatures, no secrets in client code.
- Privacy: redact or hash user identifiers in logs.
- Cost control: budget caps per session, usage tracking, caching where possible.
- Observability: structured JSON logs with session_id, user_id, event; tracing enabled in dev.
- E2E testing: Playwright headed runs with visual inspection of screenshots and traces in both local and production environments.
- Data retention: transcripts and logs must follow the policy defined in Section 4.
- Breath telemetry: computed within the response cycle; UI updates within 1s of event receipt.
- Translation overhead: median added latency <= 1s per turn for translated display.
- Localization: consent and safety copy must be available in RU when RU UI locale is enabled.

## 4. Constraints and Assumptions
- Deployment target is GCP (Cloud Run or equivalent).
- WebApp is built with React 19 + Tailwind (per DEV_PLAN).
- Payments are via Telegram Stars (currency `XTR`).
- Use OpenAI Responses API by default for Researcher.
- Gemini Subject uses long-context and optional context caching.
- Breath telemetry is derived-only by default; optional self-report is gated by config.
- All secrets are stored in Secret Manager or env vars (never committed).
- UI follows mock visuals in `mocks.md`.
- Default UI locale is EN; RU and agent-native modes are gated by feature flags until validated.
- Model configuration:
  - Researcher (test): `gpt-5-mini` (cost-effective).
  - Researcher (prod): `gpt-5` (premier).
  - Subject: latest Gemini 3.x series model (default `gemini-3.0-pro`), configurable via env.
- Budgeting:
  - Per-session token budget enforced with soft warning at 80% and hard stop at 100%.
  - Default token budgets: test 25k tokens per session; prod 200k tokens per session (configurable).
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
  - If enabled, bot posts session start/end and payment receipts to `@noel_mirror`.
  - Channel posting must be disable-able via env flag.

## 5. Open Questions
- Which languages beyond RU are in scope for the initial experiment phase (if any)?
- Does "RU as primary" mean a global default for all users, or an RU-locale default with EN still primary?
- Should Researcher and Subject always share the same interaction language, or can they diverge?
- In agent-native mode, should raw outputs be stored, and who can access them?
- What defines "experiment quality" for cross-language comparison (metrics and thresholds)?
