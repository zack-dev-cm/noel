# Задача 18.2: Исправление кнопки ссылки TMA для каналов

## Связь с юзер-кейсами
- UC-05: Bot commands and notifications

## Цель задачи
Исправить отправку сообщения в канал из `/post_tma`, используя URL-кнопку вместо `web_app`, так как Telegram каналы не принимают `web_app` в inline keyboard.

## Описание изменений

### Изменения в существующих файлах
- `apps/server/src/bot/channel.ts` — заменить `web_app` на `url`, добавить `WEB_APP_TMA_URL` (fallback `WEB_APP_URL`).
- `apps/server/src/bot/telegram.ts` — вернуть результат отправки сообщения для обработки ошибок.
- `apps/server/src/bot/commands.ts` — обрабатывать неуспешную отправку и возвращать причину.
- `docs/runbooks/deploy.md` — описать `WEB_APP_TMA_URL`.
- `docs/runbooks/ops.md` — уточнить требования для `/post_tma`.

## Детали по реализации
- В канале использовать inline кнопку `{ url: <link> }`.
- Использовать `WEB_APP_TMA_URL` для t.me deeplink, иначе fallback на `WEB_APP_URL`.
- Сообщать пользователю точную ошибку Telegram при отказе.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-18.2-01:** `/post_tma` возвращает ошибку при некорректной кнопке (до фикса).
2. **TC-E2E-18.2-02:** `/post_tma` создаёт сообщение в канале с URL-кнопкой (после фикса).

### Регрессионные тесты
- `npm run e2e` (headed, при необходимости).

## Критерии приёмки
- [ ] `/post_tma` создаёт сообщение в канале без ошибки `BUTTON_TYPE_INVALID`.
- [ ] Кнопка открывает TMA по URL.
- [ ] Ошибка Telegram возвращается оператору при неудаче.
