# Задача 17.1: Stream mirroring to Telegram channel (role labels + chunking)

## Связь с юзер-кейсами
- UC-05: Bot commands and notifications

## Цель задачи
Добавить зеркалирование всех реплик Researcher/Subject из публичной сессии в Telegram канал с понятными лейблами ролей и без потерь из-за лимитов сообщений.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/server/src/routes/stream.ts`
- После публикации стрим-ивента отправлять сообщение в канал (public session only).
- Отправка не должна блокировать API-ответ; ошибки логируются.

#### Файл: `apps/server/src/bot/channel.ts`
- Добавить `postChannelStreamUpdate` с проверкой флагов `ENABLE_PUBLIC_CHANNEL_STREAM`/`ENABLE_PUBLIC_CHANNEL_POSTS`.
- Формировать сообщение с ролью, модельным тегом и `seq`.
- Делить длинные сообщения на части под лимит Telegram без silent truncation.

#### Файл: `apps/server/src/bot/telegram.ts`
- Логировать неуспешные ответы Telegram API (status/description).

#### Файл: `docs/runbooks/deploy.md`
- Документировать опции канального стриминга и флаги включения.

#### Файл: `docs/runbooks/ops.md`
- Добавить запросы логов для канал-стриминга.

## Тест-кейсы

### Интеграционные тесты
1. **TC-INT-17.1-01:** Researcher/Subject событие публикуется в канал с корректным лейблом роли и `seq`.
2. **TC-INT-17.1-02:** Длинный ответ разбивается на несколько сообщений без потери текста.

### Регрессионные тесты
- Playwright E2E (см. задачу 17.2).

## Критерии приёмки
- [ ] Все реплики Researcher/Subject из публичной сессии публикуются в `@noel_mirror` при включенном флаге.
- [ ] Сообщения не обрезаются при превышении лимита Telegram.
- [ ] Ошибки отправки логируются в ops.
