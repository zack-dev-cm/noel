# Задача 10.1: Display model versions in Admin UI

## Связь с юзер-кейсами
- UC-06: Operator safety controls

## Цель задачи
Показать текущие версии Researcher/Subject моделей в Admin UI на основе конфигурации сервера.

## Описание изменений

### Изменения в существующих файлах
- `apps/server/src/routes/admin.ts` — добавить `model_versions` в ответ GET/POST `/api/admin/settings` (значения из `OPENAI_RESEARCHER_MODEL`, `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` с дефолтами).
- `apps/web/src/components/AdminPanel.tsx` — добавить состояние для `model_versions` и вывести значения в read-only блоке.
- `tests/e2e/telegram.ts` — поддержать override initData для тестов.
- `tests/e2e/admin.spec.ts` — добавить E2E тест отображения model versions в Admin табе.

### Интеграция компонентов
- AdminPanel использует `/api/admin/settings` и отображает `model_versions` вместе с token saver настройкой.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-20:** Admin panel displays model versions
   - Шаги: подставить initData, замокать `/api/auth/init` (isOperator=true) и `/api/admin/settings`, открыть Admin таб.
   - Ожидаемый результат: версии моделей Researcher/Subject видны, fallback отображается при наличии.

### Регрессионные тесты
- `npx playwright test --headed`

## Критерии приёмки
- [ ] `/api/admin/settings` возвращает `model_versions` вместе с `settings`.
- [ ] Admin UI выводит Researcher/Subject модели и опциональный fallback.
- [ ] E2E тест подтверждает отображение model versions.

## Примечания
- Версии моделей read-only, в БД не сохраняются.
