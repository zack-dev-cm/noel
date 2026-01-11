# Отчёт о тестировании задачи 19.2

## End-to-end тесты
- ⚠️ `npm run e2e` — FAILED (первый повторный прогон)
  - 7 passed, 3 failed
  - Ошибка: `ENOENT` при создании `test-results/.playwright-artifacts-*` (ошибка записи артефактов)
- ✅ `npm run e2e` — PASSED (после `mkdir -p test-results/.playwright-artifacts-{0..3}/traces/resources`)
  - 10 passed
- ⚠️ `PLAYWRIGHT_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app PLAYWRIGHT_API_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app npm run e2e` — FAILED
  - 8 passed, 2 failed
  - `preferences.spec.ts` timeout: overlay intercepts clicks (consent/auth экран), плюс `ENOSPC: no space left on device`
  - `streaming.spec.ts` timeout: overlay intercepts clicks (consent/auth экран)

## Модульные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Регрессионные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Примечания
- Prod E2E требует валидный `PLAYWRIGHT_INIT_DATA` для прохождения auth/consent.
- На диске осталось ~58MiB свободного места (ENOSPC в артефактах Playwright).
