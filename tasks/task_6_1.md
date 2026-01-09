# Задача 6.1: Observability (структурные логи, трассировка, ops)

## Связь с юзер-кейсами
- UC-06: Operator safety controls

## Цель задачи
Добавить structured logging, трассировку OpenAI, метрики и обновить runbooks для ops.

## Описание изменений

### Новые файлы
- `apps/server/src/observability/logger.ts` — JSON логгер.
- `apps/worker/src/observability/logger.ts` — JSON логгер для воркера.
- `apps/worker/src/observability/tracing.ts` — включение tracing.

### Изменения в существующих файлах
- `docs/runbooks/ops.md` — добавить фильтры и алерты.
- `docs/runbooks/deploy.md` — добавить шаги проверки логов.

### Детали по компонентам

#### Логирование
- Поля: `event`, `session_id`, `user_id_hash`, `severity`.
- Отдельные события: `auth_failed`, `ws_disconnect`, `model_error`.

#### Tracing
- Включить tracing в dev; отключить или ограничить в prod.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-13:** Проверка логов
   - Ожидаемый результат: при старте сессии лог содержит `session_id`.

### Модульные тесты
1. **TC-UNIT-13:** JSON logger
   - Ожидаемый результат: лог сериализуется в JSON без PII.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Структурные логи пишутся для server и worker.
- [ ] Ops runbook содержит фильтры и алерты.

## Примечания
- Хешировать telegram_id перед логированием.
