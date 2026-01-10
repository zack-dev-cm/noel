# Задача 17.2: Playwright + deploy/debug loop for channel streaming

## Связь с юзер-кейсами
- UC-05: Bot commands and notifications

## Цель задачи
Проверить E2E, выполнить деплой и убедиться, что канал получает стрим-реплики.

## Описание изменений

### Проверки
- Локальный прогон Playwright (headed) с визуальной проверкой.
- Деплой через `infra/gcp/deploy.sh`.
- Прогон Playwright против прод окружения.
- Проверка, что в `@noel_mirror` появляются новые сообщения Researcher/Subject.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-17.2-01:** `npm run e2e` (headed) локально.
2. **TC-E2E-17.2-02:** `PLAYWRIGHT_BASE_URL=... npx playwright test --headed` против прод.

### Регрессионные тесты
- `npm test` (если есть тесты).

## Критерии приёмки
- [ ] Playwright проходит локально и на прод.
- [ ] Канал получает сообщения по стриму при включенном флаге.
- [ ] Деплой выполнен без ошибок.
