# Задача 3.2: Gemini Subject (3.x), контекст, кеширование

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-06: Operator safety controls

## Цель задачи
Интегрировать Gemini 3.x модель для Subject, поддержать длинный контекст и (опционально) контекст-кеширование.

## Описание изменений

### Новые файлы
- `apps/worker/src/gemini/client.ts` — клиент Gemini API.
- `apps/worker/src/gemini/context.ts` — управление контекстом.

### Изменения в существующих файлах
- `apps/worker/src/runner.ts` — шаг Subject после Researcher.

### Детали по компонентам

#### Gemini client
- Модель: `GEMINI_MODEL` (default `gemini-3-pro-preview`).
- Поддержка long-context.
- Если `GEMINI_CONTEXT_CACHE=true`, сохранять contextId.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-08:** Subject emits events
   - Ожидаемый результат: поток содержит сообщения Subject.

### Модульные тесты
1. **TC-UNIT-08:** Context builder
   - Добавить 3 Q/A, проверить длину и формат контекста.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Subject шаг использует Gemini API.
- [ ] Контекст сохраняется между ходами.

## Примечания
- При отсутствии ключа Gemini использовать заглушку.
