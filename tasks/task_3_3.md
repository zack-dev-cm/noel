# Задача 3.3: Интервенции, телеметрия, safety thresholds

## Связь с юзер-кейсами
- UC-04: Inject a paid intervention
- UC-06: Operator safety controls

## Цель задачи
Добавить обработку интервенций, телеметрию (uncertainty/self-reference/latency) и правила безопасности для auto-pause/kill.

## Описание изменений

### Новые файлы
- `apps/server/src/routes/interventions.ts` — endpoint для интервенций.
- `apps/worker/src/telemetry/metrics.ts` — расчет метрик.
- `apps/worker/src/safety/thresholds.ts` — правила auto-pause/kill.

### Изменения в существующих файлах
- `apps/worker/src/runner.ts` — вставка интервенций в контекст.
- `apps/web/src/components/Interventions.tsx` — UI список интервенций.

### Детали по компонентам

#### Telemetry metrics
- `self_ref_rate`: доля местоимений `I/me/my` к длине текста.
- `uncertainty`: доля хеджинговых слов (`maybe`, `likely`, `uncertain`).
- `latency_ms`: разница времени запроса/ответа.

#### Safety thresholds
- `distress >= 0.85` -> pause.
- `distress >= 0.95` или self-harm -> kill.
- `distress >= 0.60` 3 раза подряд -> pause.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-09:** Intervention appears in stream
   - Ожидаемый результат: injected prompt отображается в ленте.

### Модульные тесты
1. **TC-UNIT-09:** Telemetry metrics
   - Проверить self_ref_rate на тексте с 2/10 местоимениями.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Интервенции добавляются в контекст и отображаются.
- [ ] Метрики телеметрии вычисляются и сохраняются.
- [ ] Пороговые правила безопасности применяются.

## Примечания
- Интервенции должны быть доступны только при entitlements.
