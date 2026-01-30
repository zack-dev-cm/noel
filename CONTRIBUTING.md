# Contributing

Thanks for your interest in contributing to Noetic Mirror!

## Development Setup

### Prerequisites
- Node.js 20+
- npm

### Local Setup
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev stack:
   ```bash
   npm run dev
   ```

## Testing

- Lint:
  ```bash
  npm run lint
  ```
- Unit/integration tests:
  ```bash
  npm test
  ```
- E2E (headed):
  ```bash
  npm run e2e
  ```

Note: production-like E2E runs require a valid `PLAYWRIGHT_INIT_DATA` (see `docs/runbooks/ops.md`).

## Pull Requests

- Keep PRs focused and small.
- Update documentation when behavior changes.
- Add or update tests for new features or bug fixes.
- Ensure CI passes before requesting review.

## Security

- Do not commit secrets or credentials.
- See `SECURITY.md` for vulnerability reporting.

## Code of Conduct

This project follows `CODE_OF_CONDUCT.md`.
