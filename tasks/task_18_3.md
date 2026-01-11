# Задача 18.3: Название кнопки `Open` + обязательный TMA deeplink

## Связь с юзер-кейсами
- UC-05: Bot commands and notifications

## Цель задачи
Переименовать кнопку в сообщении канала на `Open` и требовать `WEB_APP_TMA_URL` для открытия TMA внутри Telegram.

## Описание изменений

### Изменения в существующих файлах
- `apps/server/src/bot/channel.ts` — изменить label кнопки на `Open`.
- `apps/server/src/bot/commands.ts` — требовать `WEB_APP_TMA_URL` для `/post_tma`.
- `PRD.md`, `TZ.md`, `ARCHITECTURE.md` — обновить описание кнопки.

## Детали по реализации
- Если `WEB_APP_TMA_URL` не задан, `/post_tma` возвращает явную ошибку оператору.
- Кнопка использует URL для t.me deeplink.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-18.3-01:** `/post_tma` публикует сообщение с кнопкой `Open`.
2. **TC-E2E-18.3-02:** при отсутствии `WEB_APP_TMA_URL` бот сообщает об ошибке.

### Регрессионные тесты
- `npm run e2e` (headed, при необходимости).

## Критерии приёмки
- [ ] Кнопка в канале называется `Open`.
- [ ] Открытие происходит через t.me deeplink.
