# Задача 22.4: Playwright + deploy/debug loop для weekly reset + indicator

## Связь с юзер-кейсами
- UC-14: Free guided questions (self-awareness, embodiment, consciousness)

## Цель задачи
Провести release loop после добавления weekly reset, admin unlimited и индикатора remaining.

## Описание изменений

### Изменения в существующих файлах
- Нет обязательных изменений кода. Задача ориентирована на тестирование и деплой.

## Интеграция компонентов
- Выполнить `npx playwright test --headed` локально и визуально проверить.
- Выполнить деплой через `infra/gcp/deploy.sh`.
- Запустить Playwright headed на продовом baseURL и проверить логи guided questions.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-22.4-01:** `npx playwright test --headed` — локально (визуальная проверка).
2. **TC-E2E-22.4-02:** `PLAYWRIGHT_BASE_URL=<prod>` `npx playwright test --headed` — прод.

### Регрессионные тесты
- Проверка основных экранов (suite по умолчанию).

## Критерии приёмки
- [ ] Локальный Playwright headed проходит с визуальной проверкой.
- [ ] Продовый Playwright headed проходит с визуальной проверкой.
- [ ] Деплой выполнен; логи guided questions проверены.
