# Задача 8.1: Playwright E2E (local + prod) и release loop

## Связь с юзер-кейсами
- UC-01: WebApp onboarding and consent
- UC-02: Observe a live public session
- UC-03: Sponsor a private session with Stars
- UC-04: Inject a paid intervention
- UC-05: Bot commands and notifications
- UC-07: Session replay and resume

## Цель задачи
Расширить Playwright тесты для всех ключевых сценариев и выполнить релизный цикл: staging -> e2e -> debug -> redeploy -> prod.

## Описание изменений

### Новые файлы
- `tests/e2e/payment.spec.ts` — сценарии Stars (invoice creation).
- `tests/e2e/streaming.spec.ts` — streaming + reconnect.
- `tests/e2e/bot.spec.ts` — проверки webhook и сообщений (mocked).

### Изменения в существующих файлах
- `playwright.config.ts` — добавить профили `local` и `prod` через env.

### Детали по компонентам
- Тесты должны поддерживать запуск:
  - `PLAYWRIGHT_BASE_URL=http://localhost:5173`
  - `PLAYWRIGHT_BASE_URL=https://<cloud-run-url>`
- Скриншоты и traces сохраняются для ручной проверки.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-16:** Onboarding consent
2. **TC-E2E-17:** Streaming + reconnect
3. **TC-E2E-18:** Stars invoice creation
4. **TC-E2E-19:** Session replay

### Модульные тесты
- Нет.

### Регрессионные тесты
- Все Playwright тесты (local + prod).

## Критерии приёмки
- [ ] E2E покрывает ключевые UC.
- [ ] Скриншоты/trace визуально проверены.
- [ ] Выполнен release loop (staging/prod).

## Примечания
- Для prod тестов использовать реальные endpoints.
