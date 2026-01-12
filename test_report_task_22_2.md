# Отчёт о тестировании задачи 22.2

## End-to-end тесты
- ✅ `PLAYWRIGHT_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app PLAYWRIGHT_API_BASE_URL=https://noetic-mirror-web-zlvmfsrm6a-ue.a.run.app npx playwright test --headed` — PASSED
  - 11 passed

## Модульные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Регрессионные тесты
- ⚪ Не запускались (не требовалось для задачи).

## Примечания
- Деплой выполнен через `infra/gcp/deploy.sh` (revision: `noetic-mirror-web-00035-9f6`).
- Ручная проверка API:
  - `POST /api/auth/init` (валидный initData) — OK, получен userId.
  - `POST /api/guided-questions` — OK, получен guidanceId.
- Логи: найдено событие `guided_question_queued` в Cloud Logging.
