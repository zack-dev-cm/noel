# Задача 2.2: WebSocket стриминг, sequence IDs, reconnect

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-07: Session replay and resume

## Цель задачи
Добавить реальный WebSocket стриминг с sequence IDs, буфером в Redis и восстановлением при переподключении.

## Описание изменений

### Новые файлы
- `apps/server/src/ws/streamServer.ts` — WS обработчик.
- `apps/server/src/stream/streamService.ts` — запись событий в Redis и реплей.
- `apps/worker/src/stream/publisher.ts` — публикация событий из воркера.

### Изменения в существующих файлах
- `apps/server/src/app.ts` — инициализация WS сервера.
- `apps/web/src/hooks/useStream.ts` — WS клиент, reconnect, last_seq.

### Детали по компонентам

#### `StreamService`
- `publish(sessionId, event)` присваивает `seq` и сохраняет в Redis.
- `replay(sessionId, afterSeq)` возвращает массив событий.

#### WebSocket
- Параметры: `session_id`, `last_seq`.
- При подключении: отправить `replay`, затем подписка на live.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-06:** Reconnect replay
   - Ожидаемый результат: после reconnect клиент получает пропущенные события.
   - Примечание: На этапе заглушек события фиксированы.

### Модульные тесты
1. **TC-UNIT-05:** `StreamService.replay`
   - Добавить 3 события, запросить `afterSeq=1`.
   - Ожидаемый результат: вернуть 2 события.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] WS подключение работает и стримит события.
- [ ] Reconnect с `last_seq` корректно воспроизводит пропуски.

## Примечания
- Реальные события будут добавлены в задачах 3.x.
