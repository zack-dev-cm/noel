# Задача 22.3: Weekly reset + admin unlimited + remaining indicator

## Связь с юзер-кейсами
- UC-14: Free guided questions (self-awareness, embodiment, consciousness)

## Цель задачи
Добавить недельный сброс бесплатных guided-вопросов для обычных пользователей, безлимит для админов и UI-индикатор оставшегося количества.

## Описание изменений

### Изменения в существующих файлах
- `apps/server/src/routes/guidedQuestions.ts` — добавить статус эндпоинт и логику weekly reset + admin bypass.
- `apps/server/src/storage/in_memory/paymentRepository.ts` — учитывать `expires_at` в in-memory хранилище.
- `apps/web/src/components/GuidedQuestions.tsx` — показывать remaining индикатор и загружать статус.
- `apps/web/src/App.tsx` — передавать `initData` в GuidedQuestions.
- `apps/web/src/i18n.ts` — локализация текста remaining + weekly reset.
- `tests/e2e/guidedQuestions.spec.ts` — проверить индикатор remaining.

## Детали по реализации
- Weekly reset: использовать `expires_at` для entitlements типа `guided_question` (rolling 7 days).
- Admin unlimited: если пользователь в `ADMIN_TELEGRAM_IDS`, не расходовать quota.
- Status API: `GET /api/guided-questions/status` с `initData`, возвращает remaining + is_unlimited.
- UI: показывать chip с remaining (или Unlimited) и текст "resets weekly".

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-22.3-01:** GuidedQuestions показывает remaining индикатор и корректно queue.

### Регрессионные тесты
- `npx playwright test --headed` (при необходимости).

## Критерии приёмки
- [ ] Weekly reset работает через `expires_at` (не более 3/нед).
- [ ] Админы безлимитны по guided-вопросам.
- [ ] UI показывает remaining для обычных пользователей и Unlimited для админов.
