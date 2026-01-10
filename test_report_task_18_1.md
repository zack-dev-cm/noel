# Отчёт о тестировании задачи 18.1

## End-to-end тесты
- ✅ `PLAYWRIGHT_INIT_DATA="<generated>" PLAYWRIGHT_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app PLAYWRIGHT_API_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app npm run e2e` — PASSED

## Модульные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Регрессионные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Примечания
- InitData сгенерирован локально через `scripts/generate_init_data.js` с использованием bot token из Secret Manager.
- Скриншоты/трейсы Playwright генерируются только на неуспешных прогонах; артефакты не создавались.
