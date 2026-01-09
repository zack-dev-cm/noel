# Задача 2.1: Auth/consent + валидация initData

## Связь с юзер-кейсами
- UC-01: WebApp onboarding and consent

## Цель задачи
Реализовать серверную проверку Telegram initData, создать пользователя и обеспечить согласие (consent) перед доступом к Dashboard.

## Описание изменений

### Новые файлы
- `apps/server/src/auth/telegramInit.ts` — проверка подписи initData (HMAC).
- `apps/server/src/routes/auth.ts` — эндпоинт `POST /api/auth/init`.

### Изменения в существующих файлах
- `apps/server/src/app.ts` — подключить роут `auth` и middleware для контекста пользователя.
- `apps/web/src/hooks/useTelegram.ts` — получить `initData` из SDK.
- `apps/web/src/App.tsx` — добавить consent экран и POST запрос в `/api/auth/init`.

### Детали по компонентам

#### `validateInitData(initData: string, botToken: string) -> { ok: boolean, data?: ParsedInitData }`
- Проверить подпись согласно Telegram WebApp.
- Проверить срок жизни (`INIT_DATA_MAX_AGE_SECONDS`).
- При ошибке возвращать `ok: false`.

#### `POST /api/auth/init`
- Вход: `initData`.
- Выход: `userId`, `consented`, `isOperator`.

#### UI
- При `consented=false` показать экран согласия.
- После согласия вызвать `/api/auth/init` и перейти на Dashboard.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-05:** Consent flow
   - Ожидаемый результат: после согласия показывается Dashboard.
   - Примечание: Использовать заглушечный initData в dev.

### Модульные тесты
1. **TC-UNIT-03:** `validateInitData` с неверной подписью
   - Ожидаемый результат: `ok=false`.
2. **TC-UNIT-04:** `validateInitData` с корректным initData
   - Ожидаемый результат: `ok=true`.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] initData валидируется на сервере.
- [ ] Consent обязателен для доступа к Dashboard.
- [ ] Ошибки initData приводят к блокирующему экрану.

## Примечания
- В prod использовать реальный initData, в local — мок.
