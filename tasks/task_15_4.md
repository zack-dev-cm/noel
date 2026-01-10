# Задача 15.4: Playwright + deploy debug loop for contrast/metrics/admin

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-08: Subject breath telemetry
- UC-11: Admin configuration and usage analytics
- UC-12: Mobile navigation and readable turn pairing

## Цель задачи
Провести прод-цикл деплоя и E2E проверки для контраста, метрик и админ-доступа.

## Описание изменений

### Проверки
- Выполнить Playwright E2E (headed) в production.
- Визуально проверить читаемость текста на тёмной теме.
- Проверить наличие телеметрии в UI и логах.
- Убедиться, что админ-таб доступен для `rheuiii`.

## Тест-кейсы

### End-to-end
1. **TC-E2E-15.4-01:** Все тесты Playwright проходят (prod).
2. **TC-E2E-15.4-02:** Телеметрия отображается в Diagnostics.
3. **TC-E2E-15.4-03:** Админ панель доступна для админ-аккаунта.

## Критерии приёмки
- [ ] E2E в prod проходит с визуальной проверкой.
- [ ] Логи подтверждают telemetry в stream payload.
- [ ] UI в тёмной теме читабелен.
