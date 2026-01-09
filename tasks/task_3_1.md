# Задача 3.1: OpenAI Researcher (Responses API), бюджеты, guardrails

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-06: Operator safety controls

## Цель задачи
Интегрировать OpenAI Responses API для роли Researcher, добавить бюджет токенов и базовые guardrails, а также трекинг использования.

## Описание изменений

### Новые файлы
- `apps/worker/src/openai/client.ts` — клиент OpenAI Responses API.
- `apps/worker/src/openai/usageTracker.ts` — подсчет токенов и бюджетов.
- `apps/worker/src/safety/moderation.ts` — проверка контента.

### Изменения в существующих файлах
- `apps/worker/src/runner.ts` — шаг Researcher.
- `packages/shared/src/types.ts` — расширение типов телеметрии.

### Детали по компонентам

#### OpenAI client
- Модель: `OPENAI_RESEARCHER_MODEL` (test/prod).
- Использовать Responses API, хранить `response_id`.
- Структурировать выход (JSON schema) для telemetry extraction.

#### UsageTracker
- `record(tokensUsed: number)`
- Порог soft/hard: `SESSION_BUDGET_SOFT`, `SESSION_TOKEN_BUDGET`.
- При превышении — завершать сессию.

#### Guardrails
- Проверка контента через moderation endpoint.
- При нарушениях — инициировать kill switch.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-07:** Researcher emits events
   - Ожидаемый результат: поток содержит сообщения Researcher.

### Модульные тесты
1. **TC-UNIT-06:** BudgetTracker hard limit
   - Ожидаемый результат: при превышении бюджета возвращается `overBudget=true`.
2. **TC-UNIT-07:** Moderation blocking
   - Ожидаемый результат: при флаге self-harm сессия помечается paused.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Researcher шаг использует Responses API.
- [ ] Бюджет токенов соблюдается.
- [ ] Guardrails блокируют опасный контент.

## Примечания
- При отсутствии ключа OpenAI использовать заглушку ответа.
