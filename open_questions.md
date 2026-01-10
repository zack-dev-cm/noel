# Open Questions

- Which Telegram user IDs should be allowed in `ADMIN_TELEGRAM_IDS` for the admin token-saver page?
- Should `ADMIN_TELEGRAM_IDS` include usernames as well (we can treat non-numeric entries as usernames, case-insensitive)?
- Confirm the preferred Gemini 3.x model ID (available: `gemini-3-pro-preview`, `gemini-3-flash-preview`); currently using `gemini-3-pro-preview` with fallback `gemini-flash-latest`.
- Should model replies be streamed for both Researcher and Subject, or only Subject?
- Should we add a third "model-native" language mode (non-human) beyond EN/RU, or keep two-language experiments for now?
- What formatting should channel posts use (timestamps, turn numbers, thread replies)?
- Which model IDs should be available for admin selection (fixed list vs free text)?
- Should system prompts be read-only or editable from the admin panel?
- What user stats are required (daily active, total users, avg time, per-user drilldowns)?
- Should the stop control pause only new turns or terminate active runs immediately?
- Where should the extra admin button appear (header, dashboard card, or bottom nav)?
- Should the 40-request budget persist across worker restarts (Redis/DB), or is in-memory per worker instance acceptable?
