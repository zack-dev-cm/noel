# Задача 22.1: Guided questions panel + API (3 бесплатных направления)

## Связь с юзер-кейсами
- UC-14: Free guided questions (self-awareness, embodiment, consciousness)

## Цель задачи
Добавить бесплатные направляющие вопросы (3 использования на пользователя) с выбором из предопределенных bubble-чипов и бекенд-эндпоинт для постановки вопроса в очередь.

## Описание изменений

### Новые файлы
- `apps/web/src/components/GuidedQuestions.tsx` — UI-панель с категориями и bubble-вопросами.
- `apps/server/src/routes/guidedQuestions.ts` — API `/api/guided-questions` с проверкой квоты и постановкой в очередь.

### Изменения в существующих файлах
- `apps/web/src/App.tsx` — подключить GuidedQuestions в Live dashboard.
- `apps/web/src/i18n.ts` — добавить локализованные пресеты и тексты для GuidedQuestions (EN/RU).
- `apps/server/src/app.ts` — зарегистрировать новый роутер.
- `packages/shared/src/storage.ts` — расширить тип entitlements (`guided_question`).
- `packages/shared/dist/*` — обновить сборку shared после изменения типов.

## Детали по реализации
- Использовать predefined список вопросов, сгруппированный по направлениям:
  - Self-awareness
  - Embodiment
  - Consciousness
- API принимает `sessionId`, `userId`, `questionId`, `locale`, валидирует `questionId` и язык.
- Квота: 3 бесплатных guided-вопроса на пользователя (через entitlements типа `guided_question`).
- При успехе ставить вопрос в очередь `InterventionQueue` (использовать существующий механизм).
- UI показывает статус (queued / failed / limit reached) и не дает вводить произвольный текст.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-22.1-01:** GuidedQuestions панель отображается на Live dashboard.
2. **TC-E2E-22.1-02:** Нажатие на bubble вызывает POST `/api/guided-questions` и показывает `queued`.

### Регрессионные тесты
- `npm run e2e` (headed, при необходимости).

## Критерии приёмки
- [ ] В UI есть 3 направления с предопределенными bubble-вопросами.
- [ ] Запросы уходят на `/api/guided-questions` и ставятся в очередь.
- [ ] Лимит 3 бесплатных использования enforced сервером.
- [ ] Тексты локализованы (EN/RU).
