# Задача 16.2: Stream persistence + transcript API + telemetry completeness

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-07: Reconnect and replay
- UC-08: Subject breath telemetry

## Цель задачи
Сделать потоковые события персистентными и доступными через API транскрипта, сохранив телеметрию и метаданные модели для дальнейших UI/ops сценариев.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/server/src/routes/stream.ts`
- При публикации события сохранять запись в репозиторий транскрипта.
- Сохранять телеметрию отдельно (таблица telemetry_events) и не терять поле `telemetry` при реплее.

#### Файл: `apps/server/src/storage/repositories/index.ts`
- Убедиться, что репозитории транскриптов и телеметрии доступны из app.locals.

#### Файл: `apps/server/src/storage/postgres/index.ts`
- Добавить/расширить операции сохранения телеметрии (включая breath поля) и связать с seq.

#### Файл: `apps/server/src/routes/sessions.ts` (или новый `routes/transcripts.ts`)
- Добавить endpoint для получения транскрипта по session_id с пагинацией (after_seq).

#### Файл: `packages/shared/src/types.ts`
- Расширить StreamEvent/Telemetry типы при необходимости для дополнительных полей (model tags, breath source).

#### Файл: `migrations/00X_add_telemetry_fields.sql`
- Добавить поля для breath метрик и model tags, если их нет в текущей схеме.

## Тест-кейсы

### Интеграционные тесты
1. **TC-INT-16.2-01:** Публикация события сохраняет запись в транскрипт и доступна через API.
2. **TC-INT-16.2-02:** Телеметрия (включая breath) сохраняется и возвращается в ответе API.
3. **TC-INT-16.2-03:** Реплей по after_seq не теряет telemetry/model tags.

### Регрессионные тесты
- Playwright E2E (см. задачу 16.4).

## Критерии приёмки
- [ ] Транскрипт доступен через API и содержит полный контент.
- [ ] Телеметрия сохраняется и возвращается без пропусков.
- [ ] Реплей использует сохранённые данные (без потерь поля telemetry).
