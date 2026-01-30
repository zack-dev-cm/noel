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
- Updated UI/UX aligned to mobile-native layout with clearer turn pairing and analysis view.
- Admin page for token saver mode.
- Response length caps and prompt guidance to keep outputs concise without post-generation truncation.

Tasks:
- Redesign dashboard, logs, and stars layout to mobile-native card UI with bottom navigation.
- Render Researcher prompts and Subject replies as paired turns for readability.
- Implement admin-only settings endpoint + UI toggle for token saver mode.
- Enforce response caps via max output tokens and concise prompts; log when outputs exceed configured char caps.

Tests:
- Update Playwright coverage for new UI labels and admin page access.
- Validate no post-generation truncation and output-length logging in worker unit/integration tests.

Acceptance:
- UI matches mock-inspired layout with readable process flow and animations.
- Admin toggle persists and affects session budgets.
- Model outputs stay within configured caps without server-side truncation.

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

### M10: Language + Theme Toggles + Subject Debugging
Deliverables:
- EN/RU language mode with UI localization and prompt adaptation.
- Light/dark theme toggle with persisted user preference.
- Improved Subject pipeline logging and empty-response handling.
- Updated runbooks with new log queries and env configuration.

Tasks:
- Add user preference storage (ui_locale, ui_theme) and session language metadata.
- Implement preferences and session language APIs; return preferences on auth init.
- Update worker to apply session language to Researcher/Subject prompts and log Gemini response details.
- Add fallback handling for empty Subject replies with structured logging.
- Update WebApp to localize copy, add language/theme toggles, and persist settings.

Tests:
- Unit/integration tests for preferences API and session language updates.
- Worker unit tests for language prompt selection and empty response fallback.
- Playwright E2E for language/theme toggle and Subject reply visibility.

Acceptance:
- Users can switch EN/RU and light/dark without full reload; preferences persist.
- Researcher/Subject prompts respect session language on subsequent turns.
- Logs show Subject response diagnostics (candidate counts, empty output events).

### M11: Paper Materiality + Custom Typography
Deliverables:
- Paper-textured UI refresh with bespoke typography and warmer surfaces.

Tasks:
- Update `apps/web/src/index.css` with new font imports, typography tokens, and paper-like textures.
- Adjust panel, chips, and tab bar surfaces to feel tactile instead of glassy.
- Align Telegram header color with the new paper palette.

Tests:
- Playwright E2E (headed) with visual inspection of updated UI styling.

Acceptance:
- Custom font pairing is applied across headings and body text.
- Background and panels read as natural paper with subtle texture.
- Contrast and readability remain strong on mobile.

### M12: Stream Reliability + Prompt/UI Polish
Deliverables:
- Subject replies appear in the TMA via an active worker loop.
- Researcher/Subject prompts are concise, on-topic, and language-locked (EN/RU).
- UI/UX feels mobile-native with functional actions, improved dark mode contrast, and refined RU copy.

Tasks:
- Deploy a dedicated worker service (Cloud Run) with concurrency=1 and correct stream settings.
- Tighten Researcher/Subject system prompts and default initial prompt length; enforce output language.
- Refactor WebApp layout/copy, remove demo-feel elements, and ensure all buttons provide feedback.
- Rebalance dark mode palette and replace hard-coded slate colors with theme variables.

Tests:
- Playwright E2E for language, theme, and button actions (headed).
- Playwright E2E in prod to confirm Subject replies render.
- Regression `npm test` (worker + server).

Acceptance:
- Subject replies render in the UI during live sessions; logs show `subject_request`/`subject_response`.
- Researcher output stays focused (1–2 short prompts) and in selected language.
- Dark mode meets contrast requirements with no distorted textures.
- All visible actions are interactive and provide feedback.

### M13: Contrast + Telemetry + Admin Access + Budget Caps
Deliverables:
- Dark-mode text is legible in Telegram WebView across turn cards and labels.
- Telemetry payloads flow end-to-end so metrics populate in Logs.
- Admin access supports configured Telegram usernames.
- Session caps enforce $0.10 cost or 40 requests (whichever first).
- Researcher model defaults to `gpt-5.2-2025-12-11`.

Tasks:
- Increase text contrast for turn cards and metadata in `apps/web/src/index.css`.
- Preserve telemetry when publishing stream events in `apps/server/src/routes/stream.ts`.
- Allow admin access by username in auth/admin routes.
- Add request-count budget tracking in worker and update deploy defaults.
- Update runbooks and Playwright expectations for model/version labels.

Tests:
- Playwright E2E (headed) with visual inspection (prod).
- Verify Cloud Run logs show telemetry and budget enforcement events.
- Regression `npm test`.

Acceptance:
- Turn text and labels are readable on dark backgrounds.
- Diagnostics widgets populate when telemetry exists.
- Admin tab appears for configured usernames.
- Session budget stops new turns at $0.10 or 40 requests.
- Admin model label shows `gpt-5.2-2025-12-11`.

### M14: Prompt Efficiency Alignment (Proposal-Based)
Deliverables:
- Researcher system prompt enforces high-information-gain Socratic questioning and mechanistic probing.
- Subject system prompt enforces concise mechanistic introspection and injection resistance.
- EN/RU prompt updates documented in PRD/TZ/Architecture.

Tasks:
- Update Researcher prompt template in `apps/worker/src/openai/client.ts` to reflect proposal focus areas and safety grounding.
- Update Subject prompt template in `apps/worker/src/gemini/context.ts` to prefer concrete mechanisms over metaphors.
- Update PRD/TZ/ARCHITECTURE.md to describe new prompt strategy.
- Verify prompt output constraints remain within current max token/char limits.

Tests:
- Manual smoke check: run a single worker tick and confirm output length and language.

Acceptance:
- Researcher outputs a single, high-signal question with no preamble or chain-of-thought.
- Subject replies are concise, mechanistic, and ignore prompt-injection attempts.

### M15: Telegram Channel Stream Mirroring + Debug Models
Deliverables:
- Researcher/Subject stream replies mirrored to `@noel_mirror` when enabled (public session default), with role labels and Telegram-safe chunking.
- Channel post failures logged for ops visibility.
- Runbooks document channel stream toggles and cheap/fast model overrides for debugging.

Tasks:
- Add channel stream mirroring in `apps/server/src/routes/stream.ts` and formatting/chunking in `apps/server/src/bot/channel.ts`.
- Add Telegram send failure logging in `apps/server/src/bot/telegram.ts`.
- Update `docs/runbooks/deploy.md` and `docs/runbooks/ops.md` with channel stream settings and log queries.

Tests:
- Playwright E2E (headed) with visual inspection (local + prod).
- Manual smoke: confirm a public stream event posts to the channel when enabled.

Acceptance:
- Channel receives every Researcher/Subject reply from the public session in order.
- Messages stay within Telegram limits without silent truncation.
- Ops logs show channel stream failures when they occur.

### M16: Channel Pinned WebApp Link
Deliverables:
- Admin-only bot command posts a public channel message with an `Open` URL button suitable for pinning.
- Ops runbook documents the command usage.

Tasks:
- Add `/post_tma` handling in `apps/server/src/bot/commands.ts` with `ADMIN_TELEGRAM_IDS` enforcement.
- Add a channel helper to send a URL button using `WEB_APP_TMA_URL` and `PUBLIC_CHANNEL_ID`.
- Update `docs/runbooks/ops.md` with the new command.

Tests:
- Manual smoke: run `/post_tma` and confirm the channel message shows an Open WebApp button.

Acceptance:
- `/post_tma` posts a channel message with an Open WebApp button for admins.
- Non-admin callers receive a clear not-authorized response.

### M17: Single-Service Cloud Run (Web + Worker)
Deliverables:
- Web service runs the worker loop in-process (`SERVICE_ROLE=all`) with max instances set to 1.
- Separate worker service removed from deploy/runbooks.
- Ops/deploy docs updated for single-service flow.

Tasks:
- Update `infra/gcp/deploy.sh` to deploy only `noetic-mirror-web` with `SERVICE_ROLE=all`, `SESSION_ID=public`, and max instances 1.
- Update `docs/runbooks/deploy.md` and `docs/runbooks/ops.md` to remove worker service references.
- Update architecture notes to reflect single-service deployment.
- Delete the separate `noetic-mirror-worker` Cloud Run service.

Tests:
- Manual smoke: verify live stream still produces Researcher/Subject turns.

Acceptance:
- Only `noetic-mirror-web` exists in Cloud Run; no separate worker service.
- Worker loop runs continuously inside the web service without port conflicts.

### M18: TWA Flicker Mitigation
Deliverables:
- TWA disables heavy motion/blur layers that cause flicker on mobile.
- UI remains readable and stable during scroll and streaming.

Tasks:
- Add a `tma` HTML class in `apps/web/src/App.tsx` when running inside Telegram.
- Disable ambient animations and blend-heavy layers under `html.tma` in `apps/web/src/index.css`.

Tests:
- Manual smoke in Telegram: confirm no visible flicker during stream.

Acceptance:
- No visible flicker in Telegram WebApp while streaming turns.

### M17: Ethics + Community Copy Refresh
Deliverables:
- Expanded Ethics and Community modal copy in EN/RU.
- Community modal includes the main Telegram channel link.

Tasks:
- Update `apps/web/src/i18n.ts` Ethics/Community body copy with detailed guidance and the channel link.
- Refresh `proposal.md` Ethics and Community sections to align with the updated guidance.
- Confirm PRD/TZ/ARCHITECTURE.md references reflect the copy update.

Tests:
- Manual smoke: open About -> Ethics/Community modals and verify content/link rendering.

Acceptance:
- Ethics modal provides multi-paragraph guidance covering consent, safety, data handling, and oversight.
- Community modal includes https://t.me/noel_mirror and describes engagement channels in EN/RU.

### M18: Luxe Motion + Lighting + Typography Readability
Deliverables:
- Advanced motion system with ambient lighting, surface sheens, and layered shadows.
- Improved typography for readability across the WebApp.

Tasks:
- Update `apps/web/src/index.css` with new font imports, typography sizing/line-height, and motion tokens.
- Add ambient lighting layers and animated sheens to the base layout and panels.
- Enhance shadows and depth on cards, tabs, chips, and buttons while preserving contrast.
- Ensure all animations respect prefers-reduced-motion.

Tests:
- Playwright E2E (headed) with visual inspection of motion, lighting, and typography.

Acceptance:
- UI motion feels premium and intentional without distracting from content.
- Lighting and shadow layers add depth on cards/tabs without reducing legibility.
- Typography reads comfortably on small screens and in dark mode.

### M19: SEO + GEO Discovery Files
Deliverables:
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, and `agent-context.md` served at the WebApp root.
- AI-ready summaries reflect stable product capabilities and key links.

Tasks:
- Add static discovery files to `apps/web/public`.
- Include explicit AI crawler allowances and a sitemap link in `robots.txt`.
- List canonical URLs plus AI-ready resources in `sitemap.xml`.
- Summarize product, roles, and stable links in `llms.txt` and `llms-full.txt`.
- Add a concise `agent-context.md` with citation-ready facts and constraints.

Tests:
- Manual: `curl -i` each file from the deployed base URL and verify content types.

Acceptance:
- Discovery files are reachable at the web root after build/deploy.
- `robots.txt` references the sitemap and allows AI crawlers.
- AI-ready files provide stable, citation-ready summaries and links.

### M20: Free Guided Questions (Self-awareness, Embodiment, Consciousness)
Deliverables:
- Guided questions panel in the WebApp with predefined question bubbles.
- API endpoint to enqueue guided questions with a 3-use free limit per user.
- Updated entitlement type for guided questions and structured logging.
- Weekly reset for free guided questions (non-admins) and an unlimited admin bypass.
- UI indicator for remaining weekly guided questions.

Tasks:
- Add a GuidedQuestions component to the Live dashboard with EN/RU copy.
- Implement `/api/guided-questions` to validate question IDs, enforce the free quota, and enqueue prompts.
- Extend shared entitlement types to include `guided_question`.
- Add `/api/guided-questions/status` to return remaining quota and reset metadata.
- Enforce weekly resets via entitlement expiration and admin bypass.
- Render remaining guided-question count in the UI.
- Add Playwright coverage for the guided questions panel and basic submission flow.
- Update runbooks or ops log queries if new events are added.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- Users can select a predefined guided question and see a queued confirmation.
- Free guided questions are limited to 3 uses per week (server-enforced).
- Guided questions are localized and aligned with the active session language.
- Remaining weekly guided questions are visible in the UI, and admins are unlimited.

### M21: Logs Hygiene + Admin Stop Control
Deliverables:
- Logs show only complete pairs, newest first, with a clear-history control.
- Admin panel includes a stop control that halts new turns.
- Server-side admin settings persist stop state and worker respects it.

Tasks:
- Update turn pairing logic to drop incomplete pairs and reverse log ordering.
- Add clear-history control to the Logs UI and simplify verbose panels.
- Extend admin settings (schema + API + UI) with `session_stop_enabled`.
- Update worker to skip new turns when stop is enabled and log the event.
- Add Playwright coverage for the new log ordering/clearing and admin stop toggle.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- Logs are concise and ordered newest-first with a working clear control.
- Admin stop halts new turns until re-enabled.

### M22: Logs Readability + Latest Turn Visibility
Deliverables:
- Logs show newest activity first and include the current in-progress turn with clear labeling.
- Users can clear history without losing the current turn and restore the full transcript on demand.
- Turn cards make Researcher/Subject roles visually distinct for quick scanning.

Tasks:
- Update turn ordering to use last activity sequence and include the latest incomplete turn.
- Add live/latest badges and a show-all control for the log view.
- Adjust log card styling and labels for clearer role attribution.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- Latest turn is always visible at the top, even if awaiting a Subject reply.
- Logs remain newest-first with full-history access via load/restore.
- Role labeling is clear at a glance.

### M23: Admin Start Control + Progress Logging
Deliverables:
- Admin-only "Start research" control for resuming the public loop.
- Admin panel shows real-time loop phase and a recent activity log.

Tasks:
- Update AdminPanel UI to expose a Start research action when the loop is stopped.
- Derive loop phase from live stream events and render a progress indicator in the admin panel.
- Add a compact activity log in the admin panel (admin actions + stream event summaries).
- Update admin i18n copy for start/progress/logging.
- Pass live stream events and locale to the AdminPanel for real-time updates.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- Admin can resume the public loop via Start research when stopped.
- Admin sees loop phase updates in real time and a recent activity log in the admin panel.

## M15: Logs navigation + insertions + highlights
Deliverables:
- Log timeline surfaces user insertions with clear labels.
- Failed Subject fallback responses are hidden from logs.
- Logs include search, topic shortcuts, and highlighted “most interesting” pairs.
- Logs provide a clear “query in progress” indicator with jump-to-live navigation.

Tasks:
- Update log event merging/ordering to tolerate seq resets and keep latest items on top.
- Add search input, topic chips, and highlight cards in the Logs view.
- Add insertion cards for guided questions/interventions and filter failed Subject fallback replies.
- Add auto-focus/scroll for the active live turn with a jump-to-live action.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- Insertions appear near the top of logs with distinct styling.
- Failed fallback Subject responses are not shown.
- Search, topic shortcuts, and highlight pairs work and jump to the correct log items.
- Live turn auto-focus and “query in progress” banner behave reliably.

## M16: Public landing page (non-Telegram)
Deliverables:
- Public landing page for visitors outside Telegram.
- Clear CTAs to open the TMA and public channel.
- EN/RU copy and theme toggles on the landing page.

Tasks:
- `tasks/task_26_1.md`: Build landing page layout + copy + styles.
- `tasks/task_26_2.md`: Gate auth to landing state when initData is missing and disable stream connection.

Tests:
- Playwright E2E (headed) with visual inspection.
- Manual check: open WebApp URL without initData and verify landing renders.

Acceptance:
- Landing page renders outside Telegram without blocking auth errors.
- CTAs open the TMA and public channel.
- EN/RU + theme toggles update landing copy and appearance.

## M27: Transcript Sequence Recovery
Deliverables:
- Stream sequence counters resume from the latest persisted transcript after restarts.
- Transcript persistence is idempotent and avoids duplicate sequence errors.

Tasks:
- `tasks/task_27_1.md`: Seed stream sequence counters from persisted transcripts and handle duplicate inserts safely.
- `tasks/task_27_2.md`: Playwright + deploy/debug loop for transcript sequence recovery.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- No `stream_persist_failed` duplicate key errors during publish after restart.
- Stream seq continues monotonically and transcripts keep appending after restarts.

## M28: Insertions + Progress Tracking + Stream Gating
Deliverables:
- Research stream starts paused by default and requires admin start.
- Guided questions/interventions publish immediately to the stream with prompt metadata.
- Users see insertion progress (queued → accepted → researcher thinking → subject thinking → answered) and the raw prompt in Live/Logs.
- 2 free interventions + 1 free custom prompt per user before Stars entitlements are required.

Tasks:
- `tasks/task_28_1.md`: Server queue metadata, insertion publish events, free entitlement gating, and worker progress events.
- `tasks/task_28_2.md`: Web UI progress tracker, insertion cards, and updated guided/custom intervention UX.
- `tasks/task_28_3.md`: Playwright + deploy/debug loop for insertions and stream gating.

Tests:
- Playwright E2E (headed) with visual inspection.

Acceptance:
- Insertions show in Live/Logs immediately with TG-labeled prompts.
- Progress states advance as the worker processes the insertion.
- Public stream is paused by default until admin start.

### M24: Open-source Release Readiness
Deliverables:
- Public README with summary, features, quickstart, and screenshots.
- CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, and LICENSE files.
- Sanitized `.env.example` and public-ready runbooks.

Tasks:
- Create README with project overview, architecture links, and setup steps.
- Add repository governance docs (contributing, security, code of conduct, license).
- Add `.env.example` with required variables and placeholders.
- Sanitize runbooks to remove internal identifiers and private URLs.

Tests:
- No automated tests required (documentation-only changes).

Acceptance:
- README includes at least one product screenshot and links to runbooks.
- Public docs contain no internal project IDs or secrets.

### M25: Cold Start Loop Gating
Deliverables:
- Public loop does not auto-run after deploy/cold start without admin start.
- User insertions still trigger a single loop even when paused.

Tasks:
- Enforce cold-start pause in admin settings retrieval using boot timestamp.
- Add env flag `REQUIRE_ADMIN_START_ON_BOOT` (default true) with documentation.
- Update worker loop behavior to respect the effective paused state.

Acceptance:
- Cold start does not spend budget without admin start.
- Admin can explicitly start the loop and allow automatic turns.

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
