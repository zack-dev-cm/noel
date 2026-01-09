# Задача 4.2: Команды бота и постинг в канал

## Связь с юзер-кейсами
- UC-05: Bot commands and notifications

## Цель задачи
Добавить обработку команд бота и публикацию событий в `@noel_mirror` (опционально).

## Описание изменений

### Новые файлы
- `apps/server/src/bot/commands.ts` — обработчики `/start`, `/balance`, `/history`, `/sponsor`, `/help`.
- `apps/server/src/bot/channel.ts` — отправка в канал (если enabled).

### Изменения в существующих файлах
- `apps/server/src/routes/telegramWebhook.ts` — routing updates к commands.

### Детали по компонентам

#### Команды
- `/start` -> описание + кнопка WebApp.
- `/balance` -> количество entitlements.
- `/history` -> последние сессии.
- `/sponsor` -> ссылку на оплату.
- `/help` -> справка.

#### Канал
- Env: `ENABLE_PUBLIC_CHANNEL_POSTS=true|false`.
- События: session_start, session_end, payment_receipt.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-11:** `/start` выдаёт кнопку WebApp
   - Ожидаемый результат: сообщение с inline button.

### Модульные тесты
1. **TC-UNIT-11:** formatChannelMessage
   - Проверить форматирование payload.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Команды бота работают.
- [ ] Канал постит события при флаге enable.

## Примечания
- Использовать `@noetic_mirror_bot`.
