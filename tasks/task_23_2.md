# Задача 23.2: Playwright + deploy/debug loop for logs + admin stop

## Связь с юзер-кейсами
- UC-06: Operator safety controls
- UC-07: Session replay and resume

## Цель задачи
Провести release loop для log cleanup и admin stop control.

## Описание изменений

### Изменения в существующих файлах
- Нет обязательных изменений кода. Задача ориентирована на тестирование и деплой.

## Интеграция компонентов
- Выполнить `npx playwright test --headed` локально и визуально проверить.
- Выполнить деплой через `infra/gcp/deploy.sh`.
- Запустить Playwright headed на продовом baseURL и проверить логи.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-23.2-01:** `npx playwright test --headed` — локально.
2. **TC-E2E-23.2-02:** `PLAYWRIGHT_BASE_URL=<prod>` `npx playwright test --headed` — прод.

### Регрессионные тесты
- Проверка основных экранов (suite по умолчанию).

## Критерии приёмки
- [ ] Локальный Playwright headed проходит.
- [ ] Продовый Playwright headed проходит.
- [ ] Деплой выполнен; логи проверены.
