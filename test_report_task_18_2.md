# Отчёт о тестировании задачи 18.2

## End-to-end тесты
- ❌ `PLAYWRIGHT_INIT_DATA="<generated>" PLAYWRIGHT_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app PLAYWRIGHT_API_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app npm run e2e` — FAILED
  - Причина: `tests/e2e/preferences.spec.ts` timeout (trace: `test-results/preferences-allows-switching-language-and-theme/trace.zip`).

## Модульные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Регрессионные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Примечания
- Для стабильного прогона может потребоваться свежий `PLAYWRIGHT_INIT_DATA` с новым test user ID.
