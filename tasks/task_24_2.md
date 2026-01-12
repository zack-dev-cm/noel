# Задача 24.2: Playwright + deploy/debug loop for logs readability

## Связь с юзер-кейсами
- UC-07: Session replay and resume

## Цель задачи
Провести релизный цикл после улучшений читаемости логов и видимости текущего хода.

## Описание изменений

### Изменения в существующих файлах
- Нет обязательных изменений кода. Задача ориентирована на тестирование и деплой.

## Интеграция компонентов
- Выполнить `npx playwright test --headed` локально и визуально проверить.
- Выполнить деплой через `infra/gcp/deploy.sh`.
- Запустить Playwright headed на продовом baseURL и проверить логи.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-24.2-01:** `npx playwright test --headed` — локально.
2. **TC-E2E-24.2-02:** `PLAYWRIGHT_BASE_URL=<prod>` `npx playwright test --headed` — прод.

## Критерии приёмки
- [ ] Локальный Playwright headed проходит.
- [ ] Продовый Playwright headed проходит.
- [ ] Деплой выполнен; логи проверены.
