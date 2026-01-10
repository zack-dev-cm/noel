# Architecture - Project Noetic Mirror

## 1. Task Description
This document implements the architecture for `TZ.md` (Project Noetic Mirror). The system is a Telegram Mini App (TMA) that streams a live Researcher (OpenAI) ↔ Subject (Gemini) loop, with Stars payments, safety controls, session persistence, and GCP deployment, plus a mobile-native UI with bottom navigation, explicit turn pairing, EN/RU + theme toggles, and enhanced logging to debug empty Subject replies.

## 2. Functional Architecture

### 2.1 Functional Components

**Component: WebApp UX**
- Purpose: Present live streams, telemetry, payments, and logs with a mobile-native UI that pairs Researcher prompts to Subject replies and uses bottom navigation.
- Functions:
  - Render paired Researcher/Subject turns with explicit reply linkage and clear labeling.
    - Inputs: stream events (WS)
    - Outputs: UI updates
    - UC: UC-02, UC-07, UC-12
  - Provide bottom navigation between Live, Logs, Stars, About (and Admin for operators).
    - Inputs: user role, tab state
    - Outputs: navigational UI state
    - UC: UC-12
  - Apply paper-material design system (custom font pairing, textured backgrounds, warm palette).
    - Inputs: global CSS tokens
    - Outputs: tactile UI styling
    - UC: UC-12
  - Render language and theme toggles; apply localization and theme in real time.
    - Inputs: user preferences, session language
    - Outputs: localized UI, theme state, preference updates
    - UC: UC-09
  - Render Stars UI (tiers, interventions, receipts).
    - Inputs: pricing catalog, entitlements
    - Outputs: invoice trigger
    - UC: UC-03, UC-04
  - Display safety/consent and error states.
    - Inputs: consent status, safety events
    - Outputs: UI banners/lockouts
    - UC: UC-01, UC-06
- Dependencies: Stream Relay, Auth/Consent, Payments & Entitlements.

**Component: Auth & Consent**
- Purpose: Validate Telegram initData and enforce consent gating.
- Functions:
  - Validate initData signature and create/refresh user session.
    - Inputs: initData
    - Outputs: user profile, session scope
    - UC: UC-01
  - Persist consent acceptance and deny access without consent.
    - Inputs: consent acceptance
    - Outputs: consent status
    - UC: UC-01
- Dependencies: User Store (Postgres).

**Component: Preferences & Localization**
- Purpose: Persist user UI preferences and session language mode.
- Functions:
  - Read/write user preferences (ui_locale, ui_theme).
    - Inputs: initData, preference payload
    - Outputs: stored preferences
    - UC: UC-09
  - Read/write session language mode for active session(s).
    - Inputs: session id, language mode
    - Outputs: session language metadata
    - UC: UC-09
- Dependencies: User Store (Postgres), Session Store (Postgres).

**Component: Session Orchestrator**
- Purpose: Run Researcher/Subject loop and generate stream events.
- Functions:
  - Create sessions (public/private) and initialize context.
    - Inputs: session request, entitlements
    - Outputs: session record, loop start signal
    - UC: UC-02, UC-03
  - Run loop: Researcher (OpenAI Responses API) then Subject (Gemini).
    - Inputs: session context, interventions
    - Outputs: stream events, transcript records
    - UC: UC-02, UC-04
  - Resolve session language mode and adapt Researcher/Subject prompts accordingly.
    - Inputs: session language setting
    - Outputs: localized prompts
    - UC: UC-09
  - Apply guardrails, budget caps, and kill switch rules.
    - Inputs: telemetry + moderation signals
    - Outputs: pause/terminate events
    - UC: UC-06
- Dependencies: Guardrails, Stream Relay, Storage.

**Component: Stream Relay**
- Purpose: Deliver real-time events to clients and support reconnection.
- Functions:
  - Publish events with sequence IDs.
    - Inputs: loop events
    - Outputs: WS broadcast, Redis stream
    - UC: UC-02
  - Replay events on reconnect using last_seq.
    - Inputs: last_seq
    - Outputs: missing events, resume stream
    - UC: UC-02, UC-07
- Dependencies: Redis (pubsub/stream), Postgres (transcripts).

**Component: Payments & Entitlements**
- Purpose: Handle Telegram Stars and access gates.
- Functions:
  - Create Stars invoice links (currency XTR).
    - Inputs: plan/intervention selection
    - Outputs: invoice_link
    - UC: UC-03, UC-04
  - Process pre-checkout and successful_payment updates.
    - Inputs: Telegram webhook update
    - Outputs: entitlement updates, receipts
    - UC: UC-03, UC-04
- Dependencies: Telegram Bot API, Postgres.

**Component: Bot Notifications & Channel Posts**
- Purpose: Notify users and post public updates.
- Functions:
  - Handle bot commands (/start, /balance, /history, /sponsor, /help).
    - Inputs: Telegram updates
    - Outputs: bot messages
    - UC: UC-05
  - Post milestones to `@noel_mirror` when enabled.
    - Inputs: session/payment events
    - Outputs: channel messages
    - UC: UC-05
- Dependencies: Telegram Bot API, Payments, Sessions.

**Component: Admin Controls**
- Purpose: Operator-only configuration (token saver, safety tuning).
- Functions:
  - Read current settings.
    - Inputs: admin auth
    - Outputs: settings payload
  - Read model version configuration.
    - Inputs: admin auth
    - Outputs: model versions payload (Researcher/Subject/fallback)
  - Update token saver mode.
    - Inputs: admin auth, toggle
    - Outputs: updated settings
- Dependencies: Postgres, Auth/Consent.

**Component: Guardrails & Safety**
- Purpose: Detect distress and enforce kill switch rules.
- Functions:
  - Run safety checks on each output.
    - Inputs: Researcher/Subject text
    - Outputs: distress score, block/pause decision
    - UC: UC-06
  - Enforce thresholds (auto-pause/kill).
    - Inputs: scores + rules
    - Outputs: safety events, session state changes
    - UC: UC-06
- Dependencies: OpenAI moderation or safety model.

**Component: Telemetry & Metrics**
- Purpose: Compute and persist telemetry for UI and ops.
- Functions:
  - Compute uncertainty, self-reference, latency, token usage.
  - Derive Subject breath metrics (bpm, variability, coherence, phase, source).
  - Inputs: model responses, timestamps
  - Outputs: telemetry records
  - UC: UC-02, UC-06
  - Aggregate metrics for ops dashboards.
    - Inputs: telemetry events
    - Outputs: aggregates
    - UC: UC-06
- Dependencies: Storage.

**Component: Breath Monitor**
- Purpose: Generate a synthetic breathing signal for the Subject without exposing chain-of-thought.
- Functions:
  - Derive breath cadence from response pacing (tokens, punctuation, latency).
  - Optional structured self-report parser (strict schema, no free text) to refine metrics.
  - Emit breath source tags (derived/self_report/hybrid) for UI labeling.
- Dependencies: Session Orchestrator, Telemetry & Metrics.

**Component: Storage & Retention**
- Purpose: Persist sessions, transcripts, payments, entitlements.
- Functions:
  - Store transcripts with sequence IDs.
    - Inputs: stream events
    - Outputs: persisted records
    - UC: UC-02, UC-07
  - Enforce retention policy via scheduled cleanup.
    - Inputs: timestamps
    - Outputs: deleted/archived data
    - UC: UC-07
- Dependencies: Postgres, Redis.

**Component: Observability & Ops**
- Purpose: Structured logs, traces, alerts.
- Functions:
  - Emit JSON logs with session_id/user_id/event.
  - Track usage and budgets per session.
  - Provide log filters for auth failures, WS drops, model errors.
  - Log subject response pipeline (prompt size, candidate counts, empty output detection).
- Dependencies: Cloud Logging, OpenAI Tracing.

### 2.2 Functional Component Diagram
```mermaid
flowchart LR
  Web[WebApp UI] --> API[API/Web Service]
  API --> Auth[Auth & Consent]
  API --> Pay[Payments & Entitlements]
  API --> Stream[Stream Relay]
  API --> Store[(Postgres)]
  Stream --> Redis[(Redis)]
  Worker[Session Orchestrator] --> Stream
  Worker --> Guard[Guardrails & Safety]
  Worker --> Telemetry[Telemetry]
  Worker --> Store
  Bot[Telegram Bot] --> API
  API --> TG[Telegram Bot API]
  Worker --> OpenAI[OpenAI Responses API]
  Worker --> Gemini[Gemini API]
  API --> Logs[Cloud Logging]
  Worker --> Logs
  API --> Channel[@noel_mirror]
```

## 3. System Architecture

### 3.1 Architecture Style
Split service architecture:
- **Web Service** handles HTTP, WebSocket, bot webhook, and static frontend.
- **Worker Service** runs the Researcher/Subject loop with concurrency=1 per instance.

**Rationale:** isolates long-running model loops from WebSocket fan-out and allows independent scaling.

### 3.2 System Components

**Component: Web Service**
- Type: Backend service + static frontend
- Tech: Node.js 20, TypeScript, Express, ws, Vite build
- Interfaces:
  - REST API for auth, sessions, payments, history
  - WebSocket for streaming
  - Telegram webhook endpoint
  - Serves `web/dist` for the TMA UI
- Dependencies: Postgres, Redis, Telegram Bot API

**Component: Worker Service**
- Type: Backend worker
- Tech: Node.js 20, TypeScript
- Interfaces:
  - Redis queue or HTTP trigger from Web Service
  - Publishes events to Redis streams
- Dependencies: OpenAI API, Gemini API, Postgres, Redis

**Component: Postgres**
- Type: Database (Cloud SQL)
- Purpose: sessions, transcripts, payments, entitlements, telemetry

**Component: Redis**
- Type: Cache/stream (Memorystore)
- Purpose: stream fan-out, session state, pub/sub, replay buffers

**Component: Object Storage (optional)**
- Type: GCS bucket
- Purpose: image assets or generated images (if enabled)

**Component: Telegram Bot API**
- Type: External API
- Purpose: bot updates, invoice creation, payments, channel posts

**Component: OpenAI API**
- Type: External API
- Purpose: Researcher loop (Responses API), safety/guardrails

**Component: Gemini API**
- Type: External API
- Purpose: Subject loop (Gemini 3.x)

### 3.3 Component Diagram
```mermaid
flowchart TB
  User[Telegram User] --> WebApp[WebApp UI]
  WebApp --> WebSvc[Web Service]
  WebSvc --> WS[(WebSocket)]
  WebSvc --> PG[(Cloud SQL Postgres)]
  WebSvc --> Redis[(Memorystore Redis)]
  WebSvc --> TG[Telegram Bot API]
  WebSvc --> Channel[@noel_mirror]
  WebSvc --> Worker[Worker Service]
  Worker --> Redis
  Worker --> PG
  Worker --> OpenAI[OpenAI Responses API]
  Worker --> Gemini[Gemini API]
  WebSvc --> Logs[Cloud Logging]
  Worker --> Logs
```

## 4. Data Model

### 4.1 Conceptual Model

**Entities:**
- User
- Session
- TranscriptMessage
- Intervention
- Payment
- Entitlement
- TelemetryEvent
- SafetyEvent

### 4.2 Logical Model (Postgres)

**Table: `users`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Internal user ID |
| telegram_id | BIGINT | UNIQUE, NOT NULL | Telegram user ID |
| telegram_username | TEXT | NULL | Username (not logged) |
| consented_at | TIMESTAMP | NULL | Consent timestamp |
| is_operator | BOOLEAN | NOT NULL DEFAULT false | Operator flag |
| ui_locale | TEXT | NOT NULL DEFAULT 'en' | UI locale preference |
| ui_theme | TEXT | NOT NULL DEFAULT 'light' | UI theme preference |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() | Created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT NOW() | Updated |

**Indexes:**
- UNIQUE on `telegram_id`

**Table: `sessions`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Session ID |
| user_id | UUID | FK users(id), NULL | Owner for private sessions |
| type | TEXT | NOT NULL | public/private |
| status | TEXT | NOT NULL | pending/running/paused/ended |
| researcher_model | TEXT | NOT NULL | OpenAI model |
| subject_model | TEXT | NOT NULL | Gemini model |
| session_language | TEXT | NOT NULL DEFAULT 'en' | EN/RU session language |
| created_at | TIMESTAMP | NOT NULL | Created |
| started_at | TIMESTAMP | NULL | Started |
| ended_at | TIMESTAMP | NULL | Ended |

**Indexes:**
- INDEX on `status`
- INDEX on `created_at`

**Table: `transcript_messages`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Message ID |
| session_id | UUID | FK sessions(id) | Session |
| seq | BIGINT | NOT NULL | Sequence ID |
| role | TEXT | NOT NULL | researcher/subject/system |
| content | TEXT | NOT NULL | Message content |
| token_count | INT | NULL | Token estimate |
| created_at | TIMESTAMP | NOT NULL | Timestamp |
| metadata | JSONB | NULL | Extra data (latency, flags) |

**Indexes:**
- UNIQUE (session_id, seq)
- INDEX on (session_id, created_at)

**Table: `payments`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Payment ID |
| user_id | UUID | FK users(id) | User |
| invoice_payload | TEXT | UNIQUE, NOT NULL | Telegram payload |
| amount | INT | NOT NULL | Stars amount |
| currency | TEXT | NOT NULL | XTR |
| status | TEXT | NOT NULL | pending/paid/failed |
| created_at | TIMESTAMP | NOT NULL | Created |
| paid_at | TIMESTAMP | NULL | Paid |

**Indexes:**
- UNIQUE on `invoice_payload`

**Table: `entitlements`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Entitlement ID |
| user_id | UUID | FK users(id) | User |
| type | TEXT | NOT NULL | private_session/intervention |
| remaining | INT | NOT NULL | Remaining uses |
| expires_at | TIMESTAMP | NULL | Expiration |
| created_at | TIMESTAMP | NOT NULL | Created |

**Table: `admin_settings`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT | PK | Settings row (default) |
| token_saver_enabled | BOOLEAN | NOT NULL | Token saver flag |
| updated_at | TIMESTAMP | NOT NULL | Updated |
| updated_by | TEXT | NULL | Telegram user ID |

**Table: `interventions`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Intervention ID |
| session_id | UUID | FK sessions(id) | Session |
| user_id | UUID | FK users(id) | User |
| prompt | TEXT | NOT NULL | Prompt text |
| status | TEXT | NOT NULL | queued/applied/rejected |
| paid_amount | INT | NOT NULL | Stars amount |
| created_at | TIMESTAMP | NOT NULL | Created |

**Table: `telemetry_events`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Telemetry ID |
| session_id | UUID | FK sessions(id) | Session |
| seq | BIGINT | NOT NULL | Sequence ID |
| distress_score | REAL | NOT NULL | Safety score |
| self_ref_rate | REAL | NOT NULL | Self-reference rate |
| uncertainty | REAL | NOT NULL | Uncertainty score |
| latency_ms | INT | NOT NULL | Response latency |
| breath_bpm | REAL | NULL | Synthetic breath cadence |
| breath_variability | REAL | NULL | Breath variability (0-1) |
| breath_coherence | REAL | NULL | Breath coherence (0-1) |
| breath_phase | TEXT | NULL | inhale/exhale/hold |
| breath_source | TEXT | NULL | derived/self_report/hybrid |
| created_at | TIMESTAMP | NOT NULL | Timestamp |

**Table: `safety_events`**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Safety event |
| session_id | UUID | FK sessions(id) | Session |
| event_type | TEXT | NOT NULL | pause/kill |
| score | REAL | NOT NULL | Score |
| created_at | TIMESTAMP | NOT NULL | Timestamp |

### 4.3 ER Diagram (PlantUML)
```
@startuml
entity users {
  *id : UUID
  telegram_id : BIGINT
}
entity sessions {
  *id : UUID
  user_id : UUID
}
entity transcript_messages {
  *id : UUID
  session_id : UUID
  seq : BIGINT
}
entity payments {
  *id : UUID
  user_id : UUID
}
entity entitlements {
  *id : UUID
  user_id : UUID
}
entity interventions {
  *id : UUID
  session_id : UUID
  user_id : UUID
}
entity telemetry_events {
  *id : UUID
  session_id : UUID
  seq : BIGINT
}
entity safety_events {
  *id : UUID
  session_id : UUID
}

users ||--o{ sessions
sessions ||--o{ transcript_messages
users ||--o{ payments
users ||--o{ entitlements
sessions ||--o{ interventions
sessions ||--o{ telemetry_events
sessions ||--o{ safety_events
@enduml
```

### 4.4 Migrations and Versioning
- Use SQL migrations (`migrations/*.sql`) applied at startup.
- Backward-compatible changes first, then application deploy.
- Add indexes for (session_id, seq) and (telegram_id).

## 5. Interfaces

### 5.1 External APIs

**API: Auth**
- POST `/api/auth/init`
- Purpose: validate initData and establish user context.
- Request:
```json
{ "initData": "string" }
```
- Response:
```json
{
  "ok": true,
  "userId": "uuid",
  "consented": true,
  "isOperator": false,
  "preferences": { "ui_locale": "en", "ui_theme": "light" }
}
```

**API: Admin Settings**
- GET `/api/admin/settings`
- POST `/api/admin/settings`
- Purpose: read/update admin settings and expose model versions for the admin UI.
- Response:
```json
{
  "ok": true,
  "settings": { "token_saver_enabled": false, "updated_at": "..." },
  "model_versions": {
    "researcher": "gpt-5.2-2025-12-11",
    "subject": "gemini-3-pro-preview",
    "subject_fallback": "gemini-flash-latest"
  }
}
```

**API: User Preferences**
- GET `/api/user/preferences`
- POST `/api/user/preferences`
- Purpose: read/update user UI preferences (language + theme).
- Request:
```json
{ "initData": "string", "ui_locale": "en|ru", "ui_theme": "light|dark" }
```
- Response:
```json
{ "ok": true, "preferences": { "ui_locale": "en", "ui_theme": "light" } }
```

**API: Session Settings**
- GET `/api/sessions/{id}/settings`
- POST `/api/sessions/{id}/settings`
- Purpose: read/update session language mode (EN/RU).
- Request:
```json
{ "session_language": "en|ru", "initData": "string" }
```
- Response:
```json
{ "ok": true, "session_language": "en" }
```

**API: Sessions**
- POST `/api/sessions/public/start` (operator)
- POST `/api/sessions/private/start`
- GET `/api/sessions/{id}`

**API: Stream (WebSocket)**
- WS `/ws/stream?session_id=...&last_seq=...`
- Events:
```json
{
  "seq": 42,
  "role": "subject",
  "content": "...",
  "ts": "...",
  "telemetry": {
    "distress_score": 0.12,
    "self_ref_rate": 0.08,
    "uncertainty": 0.14,
    "latency_ms": 1820,
    "breath": {
      "bpm": 13.8,
      "variability": 0.22,
      "coherence": 0.78,
      "phase": "exhale",
      "source": "derived"
    }
  }
}
```

**API: Payments**
- POST `/api/payments/invoice`
```json
{ "type": "private_session|intervention", "amount": 100, "initData": "..." }
```
- Response:
```json
{ "invoice_link": "https://t.me/pay?..." , "amount": 100, "currency": "XTR" }
```

**Telegram Webhook**
- POST `/telegram/webhook/{secret}`
- Handles `pre_checkout_query` and `successful_payment`.

### 5.2 Internal Interfaces

**Interface: Web → Worker**
- Protocol: Redis queue `session:start`
- Message:
```json
{ "session_id": "uuid", "mode": "public|private" }
```

**Interface: Worker → Stream Relay**
- Protocol: Redis stream `session:{id}:events`
- Message:
```json
{ "seq": 42, "role": "subject", "content": "...", "telemetry": { "breath": { "bpm": 13.8 } } }
```

### 5.3 External Integrations

**Telegram Bot API**
- createInvoiceLink (Stars)
- sendMessage / sendPhoto
- setWebhook
- Error handling: retries with exponential backoff; log status + payload.

**OpenAI Responses API**
- Researcher model `gpt-5.2-2025-12-11`.
- Structured outputs for tools and telemetry parsing.
- Use `previous_response_id` for reasoning reuse.

**Gemini API**
- Subject model `gemini-3-pro-preview` (configurable).
- Long-context enabled; optional context caching.
- Optional breath self-report via strict JSON schema (no free text, no chain-of-thought).

## 6. Technology Stack

### 6.1 Backend
- Node.js 20 + TypeScript
- Express + ws
- PostgreSQL client: `pg`
- Redis client: `ioredis`
- Telegram: direct REST calls to Bot API (avoid heavy dependencies)

**Rationale:** aligns with TMA JS ecosystem and simplifies WebSocket + webhook handling.

### 6.2 Frontend
- React 19 + Vite + Tailwind CSS
- Telegram WebApp SDK

### 6.3 Datastores
- PostgreSQL (Cloud SQL)
- Redis (Memorystore)

### 6.4 Infrastructure
- Docker + Cloud Build
- Cloud Run (web + worker)
- Secret Manager for API keys and bot tokens
- Cloud Logging + alerting

## 7. Security

### 7.1 AuthN/AuthZ
- Validate Telegram initData with HMAC-SHA256 using bot token.
- Operator actions require `is_operator` flag and admin header.

### 7.2 Data Protection
- TLS for all external traffic.
- Secrets in Secret Manager, never in git.
- Logs use hashed user IDs; redact Telegram handles.

### 7.3 Abuse Prevention
- Rate limit auth and payments endpoints.
- Enforce max prompt length and input sanitization.
- Reject interventions that fail safety checks.

## 8. Scalability & Performance

### 8.1 Scaling Strategy
- Web service scales for viewers (higher concurrency).
- Worker service scales for sessions with concurrency=1 per instance.

### 8.2 Caching
- Redis stream buffers for quick replay.
- Session metadata cached in Redis with TTL.
- Gemini context caching disabled by default; enable only if cost/latency goals require it.

### 8.3 DB Optimization
- Index on (session_id, seq) for transcript replay.
- Index on payments invoice_payload and user_id.

## 9. Reliability

### 9.1 Error Handling
- Retries with exponential backoff for OpenAI and Gemini calls; Telegram calls are best-effort.
- Circuit-breaker behavior on repeated failures.

### 9.2 Backups
- Cloud SQL automated backups (daily).
- Optional export to GCS for long-term archives.

### 9.3 Monitoring
- Log-based alerts for auth failures, WS disconnect spikes, model errors.
- Track session latency, token usage, request counts, and cost budgets per session.

## 10. Deployment

### 10.1 Environments
- Dev: local Docker + local Postgres/Redis.
- Staging: Cloud Run with `gpt-5.2-2025-12-11` + `gemini-3-pro-preview`.
- Prod: Cloud Run with `gpt-5.2-2025-12-11` + `gemini-3-pro-preview`.

### 10.2 CI/CD
- GitHub Actions: lint/test → Playwright → build → deploy.
- Cloud Build for container image.

### 10.3 Configuration
- Env vars and Secret Manager:
  - `OPENAI_API_KEY`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`
  - `DATABASE_URL`, `REDIS_URL`
  - `WEB_APP_URL`, `WEBHOOK_BASE_URL`, `WEBHOOK_SECRET`
  - `OPENAI_RESEARCHER_MODEL`, `GEMINI_MODEL`
  - `GEMINI_FALLBACK_MODEL`
  - `SESSION_TOKEN_BUDGET`, `SESSION_BUDGET_SOFT`
  - `SESSION_COST_BUDGET`, `SESSION_COST_BUDGET_SOFT`, `OPENAI_COST_PER_1K_TOKENS`
  - `SESSION_REQUEST_BUDGET`, `SESSION_REQUEST_BUDGET_SOFT`
  - `WORKER_TICK_SECONDS`
  - `STARS_STARGAZER`, `STARS_COSMIC_PATRON`, `STARS_UNIVERSAL_ARCHITECT`
  - `PUBLIC_CHANNEL_ID`, `ENABLE_PUBLIC_CHANNEL_POSTS`
  - `ADMIN_TELEGRAM_IDS` (IDs or usernames)
  - `RESEARCHER_MAX_OUTPUT_TOKENS`, `SUBJECT_MAX_OUTPUT_TOKENS`
  - `RESEARCHER_MAX_OUTPUT_CHARS`, `SUBJECT_MAX_OUTPUT_CHARS`
  - `RESEARCHER_MAX_OUTPUT_TOKENS_SAVER`, `SUBJECT_MAX_OUTPUT_TOKENS_SAVER`
  - `RESEARCHER_MAX_OUTPUT_CHARS_SAVER`, `SUBJECT_MAX_OUTPUT_CHARS_SAVER`

### 10.4 Deployment Notes
- Cloud Run web service: public, concurrency >1, `SERVICE_ROLE=web`.
- Cloud Run worker service: concurrency=1, `SERVICE_ROLE=worker`, `WORKER_HTTP_ENABLED=true`,
  and `STREAM_PUBLISH_URL`/`SETTINGS_API_BASE` pointing at the web service.
- Min/max instances explicitly set; VPC connector if using private Redis.

## 11. Open Questions
None.
