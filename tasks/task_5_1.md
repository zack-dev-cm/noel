# Задача 5.1: Реальная персистентность (Postgres/Redis) + retention job

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-07: Session replay and resume

## Цель задачи
Подключить реальный Postgres/Redis, заменить in-memory реализации и добавить job для retention политики.

## Описание изменений

### Новые файлы
- `apps/server/src/storage/postgres/*.ts` — реальные реализации репозиториев.
- `apps/server/src/storage/retention.ts` — задачи очистки по TTL.

### Изменения в существующих файлах
- `apps/server/src/storage/db.ts` — подключение через `DATABASE_URL`.
- `apps/server/src/storage/redis.ts` — подключение через `REDIS_URL`.
- `apps/server/src/app.ts` — запуск retention job по интервалу.

### Детали по компонентам

#### Retention job
- Удалять:
  - public transcripts старше 30 дней
  - private transcripts старше 14 дней
  - logs/traces старше 14 дней
- Запуск: каждые 12 часов.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-12:** Replay from DB
   - Ожидаемый результат: после reconnect данные берутся из Postgres.

### Модульные тесты
1. **TC-UNIT-12:** retention job
   - Ожидаемый результат: удаляются записи старше TTL.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Репозитории работают с Postgres.
- [ ] Redis используется для stream buffer.
- [ ] Retention job очищает данные согласно политике.

## Примечания
- В local использовать docker-compose Postgres/Redis.
