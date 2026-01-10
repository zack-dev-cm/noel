# Отчёт о тестировании задачи 16.6

## Модульные тесты
- ✅ `npm --workspace apps/worker run test` — PASSED

## End-to-end тесты
- ✅ `npm run e2e` — PASSED
- ✅ `PLAYWRIGHT_INIT_DATA="$(TELEGRAM_BOT_TOKEN=... node scripts/generate_init_data.js)" PLAYWRIGHT_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app PLAYWRIGHT_API_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app npx playwright test --headed --workers=1` — PASSED

## Примечания
- Для prod-Playwright требуется quoting `PLAYWRIGHT_INIT_DATA`, потому что initData содержит `&`.
