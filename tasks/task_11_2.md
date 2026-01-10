# Задача 11.2: Release loop (deploy + e2e)

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-07: Session replay and resume
- UC-12: Mobile navigation and readable turn pairing

## Цель задачи
Выполнить release loop для обновленного UI: локальный E2E, деплой, продовый E2E, проверка логов и фиксация результатов.

## Описание изменений

### Изменения в существующих файлах
- Нет обязательных изменений кода. Задача ориентирована на тестирование и деплой.

## Интеграция компонентов
- Использовать `infra/gcp/deploy.sh` для выката в Cloud Run.
- Запустить Playwright E2E локально и против продового baseURL.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-11.2-01:** Playwright local headed
   - Входные данные: `npm run e2e`
   - Ожидаемый результат: все тесты PASSED
2. **TC-E2E-11.2-02:** Playwright against production
   - Входные данные: `PLAYWRIGHT_BASE_URL=<prod-url> npm run e2e`
   - Ожидаемый результат: все тесты PASSED

### Модульные тесты
- Не требуются.

### Регрессионные тесты
- Полный Playwright E2E suite.

## Критерии приёмки
- [ ] Локальные Playwright E2E тесты прошли (headed, визуальный просмотр).
- [ ] Деплой выполнен по runbook.
- [ ] Продовые Playwright E2E тесты прошли (headed, визуальный просмотр).
- [ ] Логи Cloud Run проверены по runbook.
- [ ] Результаты тестов задокументированы.

## Примечания
- При отсутствии доступа к GCP зафиксировать блокирующую причину в отчете.
