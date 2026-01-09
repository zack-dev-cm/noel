# Задача 4.1: Telegram Stars платежи, entitlements, receipts

## Связь с юзер-кейсами
- UC-03: Sponsor a private session with Stars
- UC-04: Inject a paid intervention

## Цель задачи
Реализовать создание Stars invoice, обработку webhook событий и выдачу entitlements, а также UI для оплаты.

## Описание изменений

### Новые файлы
- `apps/server/src/payments/telegram.ts` — createInvoiceLink и обработка статусов.
- `apps/server/src/routes/payments.ts` — `/api/payments/invoice`.
- `apps/server/src/routes/telegramWebhook.ts` — `pre_checkout_query` и `successful_payment`.
- `apps/web/src/components/StarsPanel.tsx` — UI платежей.

### Изменения в существующих файлах
- `apps/web/src/App.tsx` — интеграция StarsPanel.
- `packages/shared/src/types.ts` — `PaymentInvoice`, `Entitlement`.

### Детали по компонентам

#### Payments API
- `POST /api/payments/invoice` принимает `type` и `initData`.
- Ответ: `invoice_link`, `amount`, `currency`.
- Валюта: `XTR`, provider_token пустой.

#### Webhook
- `pre_checkout_query` -> отвечать `ok=true`.
- `successful_payment` -> mark paid, create entitlement.

#### Pricing
- Использовать конфиг `STARS_PRIVATE_SESSION=100`, `STARS_INTERVENTION=50` (можно менять env).

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-10:** Invoice creation
   - Ожидаемый результат: API возвращает `invoice_link`.

### Модульные тесты
1. **TC-UNIT-10:** createInvoiceLink payload
   - Проверить currency `XTR` и пустой provider_token.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] Invoice создается через Telegram Bot API.
- [ ] Entitlements создаются после `successful_payment`.
- [ ] UI открывает invoice через `openInvoice`.

## Примечания
- В local разрешается заглушка invoice_link.
