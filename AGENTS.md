# Repository Agent Instructions

## Scope
These instructions apply to all agents operating in this repository. Follow them strictly.

## Mandatory Multiagent Process
Follow the multiagent development practices at /Users/zack/Documents/GitHub/agents.
Required stages and cycles:
- Analysis (PRD/TZ): max 2 review cycles.
- Architecture: max 2 review cycles.
- Planning: max 1 review cycle (2 reviews total).
- Development: max 1 fix cycle per task.

Rules:
- Do not exceed role boundaries (analyst, architect, planner, developer, reviewers).
- Record blocking questions and stop for user input.
- Maintain status in status.md and open questions in open_questions.md.

## Required Artifacts
- PRD.md (product requirements).
- ARCHITECTURE.md (system design and interfaces).
- DEV_PLAN.md (task plan).
- status.md (stage/task status).
- open_questions.md (blocking questions).

## OpenAI API Best Practices (Required)
Follow best practices from:
- /Users/zack/Documents/GitHub/openai-cookbook/
- /Users/zack/Documents/GitHub/openai-agents-python/
- /Users/zack/Documents/GitHub/openai-agents-python/docs
- /Users/zack/Documents/GitHub/openai-chatkit-advanced-samples

Minimum requirements:
- Use the OpenAI Responses API by default; only use Chat Completions when required.
- Prefer structured outputs and JSON schema for tool calls.
- Keep prompts explicit and decomposed for complex tasks.
- Do not show chain-of-thought or raw reasoning to end users.
- Use input/output guardrails for safety and cost control.
- Track token usage and enforce budgets per session.
- Use tracing in development; disable or restrict sensitive logs where needed.
- Implement retries with exponential backoff for rate limits and transient errors.
- Keep secrets in env vars; never commit keys.

## ChatKit Guidance (If Used)
- Export OPENAI_API_KEY and VITE_CHATKIT_API_DOMAIN_KEY.
- Add the domain to the OpenAI allowlist and Vite allowedHosts.
- Keep backend and frontend separated and run both locally for development.

## Testing and Release (Strict)
- Strictly test e2e with Playwright.
- Inspect screenshots and Playwright results visually for every run.
- Debug, deploy, re-test e2e, debug, redeploy again until clean.

## Security and Privacy
- Validate Telegram initData signatures server-side.
- Redact or hash user identifiers in logs.
- Avoid storing secrets in client code or git.

## Commit and Push
- Use concise, imperative commit messages.
- Create and push to a private repo using DEV_CM_GITHUB_TOKEN from bashrc.
