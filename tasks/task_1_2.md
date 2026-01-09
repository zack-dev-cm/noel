# Задача 1.2: Слой данных и заглушки хранилищ

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-03: Sponsor a private session with Stars
- UC-07: Session replay and resume

## Цель задачи
Создать слой хранения с интерфейсами для Postgres/Redis и ин-мемори заглушками, чтобы последующие задачи могли работать через единый контракт.

## Описание изменений

### Новые файлы
- `apps/server/src/storage/db.ts` — интерфейс подключения к Postgres (пока заглушка).
- `apps/server/src/storage/redis.ts` — интерфейс подключения к Redis (пока заглушка).
- `apps/server/src/storage/repositories/*.ts` — репозитории (User, Session, Transcript, Payments).
- `apps/server/src/storage/in_memory/*.ts` — Map-based реализации.
- `migrations/001_init.sql` — схема БД (таблицы из ARCHITECTURE.md).
- `packages/shared/src/storage.ts` — общие интерфейсы репозиториев.

### Изменения в существующих файлах
- `apps/server/src/app.ts` — внедрить слой хранения через DI (выбор in-memory по env).

### Детали по компонентам

#### Репозитории
- `UserRepository`: `getByTelegramId(telegramId: string)`, `createUser(...)`.
- `SessionRepository`: `createSession(...)`, `updateStatus(...)`, `getSession(...)`.
- `TranscriptRepository`: `appendMessage(...)`, `getMessagesAfterSeq(...)`.
- `PaymentRepository`: `createInvoice(...)`, `markPaid(...)`, `getEntitlements(...)`.

#### Конфигурация
- Если `DATABASE_URL` пуст — использовать in-memory реализации.
- Если `REDIS_URL` пуст — использовать in-memory buffer для stream.

### Интеграция компонентов
- Все API и воркерные компоненты обращаются к репозиториям через `packages/shared` интерфейсы.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-02:** Потоковые события читаются через репозиторий
   - Ожидаемый результат: заглушка возвращает 2-3 события для воспроизведения.
   - Примечание: На этапе заглушек ожидаются статические события.

### Модульные тесты
1. **TC-UNIT-02:** In-memory `TranscriptRepository`
   - Входные данные: добавление 3 сообщений
   - Ожидаемый результат: `getMessagesAfterSeq(1)` возвращает 2 сообщения

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Есть интерфейсы репозиториев и in-memory реализации.
- [ ] В `migrations/001_init.sql` описаны таблицы из архитектуры.
- [ ] API использует репозитории вместо прямых заглушек.

## Примечания
- Не подключать реальный Postgres на этой задаче.
