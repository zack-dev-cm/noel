# Задача 14.1: Worker service deploy + Subject stream visibility

## Связь с юзер-кейсами
- UC-02: Observe a live public session

## Цель задачи
Обеспечить публикацию Subject ответов в TMA через активный worker-сервис и устранить отсутствие live-ответов в UI.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `infra/gcp/deploy.sh`
- Добавить деплой отдельного Cloud Run сервиса для worker (`SERVICE_ROLE=worker`).
- Выставить `concurrency=1`, `min-instances=1`, `max-instances=1` для worker.
- Установить `WORKER_HTTP_ENABLED=true` и `STREAM_PUBLISH_URL/SETTINGS_API_BASE` на web-сервис.

#### Файл: `docs/runbooks/deploy.md`
- Описать параметры деплоя worker-сервиса и переменные окружения.

#### Файл: `docs/runbooks/ops.md`
- Добавить лог-запросы/процедуры для проверки worker-сервиса (subject_request/response).

## Тест-кейсы

### Интеграционные тесты
1. **TC-INT-14.1-01:** Worker публикует события в `/api/stream/publish` и они видны в UI.

### Регрессионные тесты
- Playwright E2E (см. задачу 14.4).

## Критерии приёмки
- [ ] Worker сервис развернут отдельно от web и работает с concurrency=1.
- [ ] В логах есть `subject_request` и `subject_response`.
- [ ] Subject ответы отображаются в TMA UI.
