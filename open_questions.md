# Open Questions

- Provide a valid `PLAYWRIGHT_INIT_DATA` (or allow me to generate one by supplying `TELEGRAM_BOT_TOKEN`) so prod E2E can authenticate without the "Missing Telegram initData" overlay.
- Which Telegram user IDs should be allowed in `ADMIN_TELEGRAM_IDS` for the admin token-saver page?
- Should `ADMIN_TELEGRAM_IDS` include usernames as well (we can treat non-numeric entries as usernames, case-insensitive)?
- Confirm the preferred Gemini 3.x model ID (available: `gemini-3-pro-preview`, `gemini-3-flash-preview`); currently using `gemini-3-pro-preview` with fallback `gemini-flash-latest`.
- Should we add a third "model-native" language mode (non-human) beyond EN/RU, or keep two-language experiments for now?
- Confirm whether channel streaming should include private sessions (currently public-only).
- Confirm preferred low-cost model IDs for debugging (OpenAI + Gemini).
- Which model IDs should be available for admin selection (fixed list vs free text)?
- Should system prompts be read-only or editable from the admin panel?
- What user stats are required (daily active, total users, avg time, per-user drilldowns)?
- Stop control currently pauses new turns only; do you also want in-flight turn termination?
- Should the 40-request budget persist across worker restarts (Redis/DB), or is in-memory per worker instance acceptable?
- Confirm `OPENAI_COST_PER_1K_TOKENS` for `gpt-5.2-2025-12-11` (currently using 0.03) to enforce the $0.10 cap accurately.
- Can I delete Playwright artifacts in `test-results/` to free disk space (only ~58MiB left)?
- Confirm the canonical public base URL for robots/sitemap/llms (currently set to the Cloud Run service URL from docs/runbooks/deploy.md).
- Confirm preferred landing page CTA URLs (TMA deep link + public channel) and whether the whitepaper should open an external URL.
