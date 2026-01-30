# Задача 30.2: Playwright + deploy/debug loop for cold start gating

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-06: Operator safety controls

## Цель задачи
Проверить поведение cold start gating локально и в проде, убедиться в отсутствии автозапуска без admin start.

## Описание изменений

### Шаги
- Запустить Playwright e2e локально (headed) и визуально проверить, что без admin start цикл не запускается.
- Деплой сервиса.
- Запустить Playwright e2e против прод-сервиса с валидным `PLAYWRIGHT_INIT_DATA`.
- Проверить Cloud Logging на отсутствие автоматических запусков после cold start.

## Тест-кейсы
1. **TC-CS-30.2-01:** `npm run e2e` проходит локально.
2. **TC-CS-30.2-02:** `PLAYWRIGHT_BASE_URL=<prod> ... npx playwright test --headed` проходит.
3. **TC-CS-30.2-03:** В логах нет автозапусков без admin start после cold start.

## Критерии приёмки
- [ ] Локальные E2E проходят.
- [ ] Продовые E2E проходят.
- [ ] В Cloud Logging нет автозапусков без admin start.
