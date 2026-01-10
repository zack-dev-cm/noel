# Задача 12.2: Worker language prompts + Subject logging/fallbacks

## Связь с юзер-кейсами
- UC-09: Configure language mode and theme

## Цель задачи
Адаптировать промпты Researcher/Subject под язык сессии (EN/RU) и улучшить наблюдаемость пайплайна Subject, чтобы устранить пустые ответы.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/worker/src/admin/settings.ts`
- Добавить клиент для `GET /api/sessions/:id/settings`.
- Возвращать `session_language` для текущей сессии.

#### Файл: `apps/worker/src/openai/client.ts`
- Добавить параметр `language?: 'en' | 'ru'`.
- Использовать локализованные system prompts для EN/RU.

#### Файл: `apps/worker/src/gemini/context.ts`
- Добавить параметр `language?: 'en' | 'ru'`.
- Локализовать заголовок/инструкции для Subject.

#### Файл: `apps/worker/src/gemini/client.ts`
- Добавить параметры `sessionId` и `language` для логирования.
- Логировать `subject_request` (prompt size, model, max tokens/chars).
- Логировать `subject_response` (output length, candidate count).
- Если ответ пустой (trim length == 0), логировать `subject_empty_response` и попытаться fallback-модель.
- Если fallback также пустой, вернуть безопасную заглушку вместо пустого текста.

#### Файл: `apps/worker/src/runner.ts`
- Получать `session_language` перед выполнением ходов.
- Передавать `language` в `runResearcherTurn`, `buildContext`, `runSubjectTurn`.
- Логировать `session_language_applied` и длину вывода Subject.

#### Файл: `apps/worker/src/observability/logger.ts`
- Добавить поддержку `LOG_LEVEL` (info|debug|warn|error) и фильтрацию debug-логов.

## Интеграция компонентов
- Worker читает `session_language` через API Web Service.
- Промпты Researcher/Subject используют локализованные system инструкции.
- Логи Cloud Logging включают диагностические поля для Subject пайплайна.

## Тест-кейсы

### Модульные тесты
1. **TC-UNIT-12.2-01:** Researcher system prompt меняется при `language='ru'`.
2. **TC-UNIT-12.2-02:** Gemini fallback применяется при пустом ответе.

### Регрессионные тесты
- Запустить worker smoke test и Playwright E2E suite (см. 12.4).

## Критерии приёмки
- [ ] Researcher/Subject используют язык сессии для последующих turn-ов.
- [ ] Пустые ответы Subject не попадают в stream (есть fallback текст).
- [ ] В логах есть `subject_request`, `subject_response`, `subject_empty_response`.
