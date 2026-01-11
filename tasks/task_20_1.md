# Задача 20.1: Объединить worker в web и удалить отдельный сервис

## Связь с юзер-кейсами
- UC-02: Observe a live public session

## Цель задачи
Перевести запуск worker цикла в веб-сервис (SERVICE_ROLE=all) и удалить отдельный Cloud Run сервис `noetic-mirror-worker`.

## Описание изменений

### Изменения в существующих файлах
- `infra/gcp/deploy.sh` — деплой только `noetic-mirror-web`, max instances = 1, SERVICE_ROLE=all.
- `docs/runbooks/deploy.md` — убрать отдельный worker сервис и инструкции.
- `docs/runbooks/ops.md` — обновить лог-запросы без ссылки на worker сервис.
- `ARCHITECTURE.md` — отразить single-service deployment.
- `PRD.md`, `TZ.md` — зафиксировать single-instance requirement.

### Действия в инфраструктуре
- Удалить Cloud Run сервис `noetic-mirror-worker`.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-20.1-01:** Поток Researcher/Subject продолжается в публичной сессии после деплоя.

### Регрессионные тесты
- `npm run e2e` (headed, при необходимости).

## Критерии приёмки
- [ ] В Cloud Run остался только `noetic-mirror-web` (max instances = 1).
- [ ] Worker loop выполняется внутри web-сервиса.
- [ ] Стримы продолжают публиковаться и отображаться в TMA.
