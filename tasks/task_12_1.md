# Задача 12.1: Preferences + session language storage (DB + API)

## Связь с юзер-кейсами
- UC-09: Configure language mode and theme

## Цель задачи
Добавить хранение предпочтений пользователя (язык UI, тема) и язык сессии, а также API для чтения/обновления этих значений.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `packages/shared/src/storage.ts`
- Добавить поля `ui_locale`, `ui_theme` в `UserRecord`.
- Добавить поле `session_language` в `SessionRecord`.
- Добавить методы репозиториев:
  - `UserRepository.updatePreferences(userId, { ui_locale, ui_theme })`.
  - `SessionRepository.updateSessionLanguage(sessionId, session_language)`.

#### Файл: `apps/server/src/storage/postgres/index.ts`
- Обновить SQL вставки/чтения для `users` и `sessions` с новыми колонками.
- Реализовать `updatePreferences` и `updateSessionLanguage`.

#### Файл: `apps/server/src/storage/in_memory/userRepository.ts`
- Хранить и обновлять `ui_locale`, `ui_theme`.

#### Файл: `apps/server/src/storage/in_memory/sessionRepository.ts`
- Хранить и обновлять `session_language`.

#### Файл: `apps/server/src/routes/auth.ts`
- Возвращать `preferences` в ответе `/api/auth/init`.
- Устанавливать дефолтные `ui_locale='en'`, `ui_theme='light'` при создании пользователя.

#### Файл: `apps/server/src/routes/userPreferences.ts` (новый)
- GET `/api/user/preferences` — вернуть текущие предпочтения пользователя.
- POST `/api/user/preferences` — обновить `ui_locale` и/или `ui_theme`.
- Проверка через `initData` (как в admin).
- Логировать `preferences_updated` с `user_id` (hash).

#### Файл: `apps/server/src/routes/sessionSettings.ts` (новый)
- GET `/api/sessions/:id/settings` — вернуть `session_language`.
- POST `/api/sessions/:id/settings` — обновить `session_language`.
- Для воркера разрешить доступ по `x-stream-token`.
- При отсутствии сессии создать запись (type=public, status=running, модели из env).
- Логировать `session_language_updated` с `session_id` и `user_id` (если есть).

#### Файл: `apps/server/src/index.ts`
- Подключить новые маршруты `userPreferences` и `sessionSettings`.

#### Файл: `migrations/004_user_preferences_and_session_language.sql` (новый)
- Добавить `ui_locale`, `ui_theme` в `users`.
- Добавить `session_language` в `sessions`.

## Интеграция компонентов
- Frontend вызывает `/api/user/preferences` для сохранения языка/темы.
- Frontend обновляет `/api/sessions/:id/settings` для языка текущей сессии.
- Worker использует `/api/sessions/:id/settings` (см. задачу 12.2).

## Тест-кейсы

### Интеграционные тесты
1. **TC-INT-12.1-01:** POST `/api/user/preferences` сохраняет `ui_locale` и `ui_theme`
2. **TC-INT-12.1-02:** POST `/api/sessions/:id/settings` обновляет `session_language`

### Регрессионные тесты
- Запустить Playwright E2E suite после интеграции UI (см. 12.4).

## Критерии приёмки
- [ ] В БД добавлены новые поля и миграция проходит без ошибок.
- [ ] `/api/auth/init` возвращает `preferences`.
- [ ] Предпочтения сохраняются и читаются через API.
- [ ] Язык сессии хранится и обновляется через API.
- [ ] Логи содержат `preferences_updated` и `session_language_updated`.
