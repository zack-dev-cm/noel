# Задача 30.1: Cold start pause enforcement (admin settings + worker)

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-06: Operator safety controls

## Цель задачи
Исключить автозапуск исследовательского цикла после деплоя/холодного старта без явного старта админом, при этом сохранив обработку пользовательских insertions.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/server/src/storage/postgres/index.ts`
- В `admin.getSettings()`:
  - Добавить проверку времени последнего обновления настроек относительно времени старта сервиса.
  - Если `session_stop_enabled=false` и `updated_at` старше текущего старта, принудительно выставлять `session_stop_enabled=true`.
  - Значение по умолчанию при первом создании настроек — `session_stop_enabled=true`.

#### Файл: `apps/server/src/storage/in_memory/adminRepository.ts`
- Аналогично добавить защиту cold start с использованием времени старта процесса.

#### Файл: `.env.example`
- Добавить `REQUIRE_ADMIN_START_ON_BOOT=true` с описанием.

#### Файл: `docs/runbooks/deploy.md`
- Добавить `REQUIRE_ADMIN_START_ON_BOOT` в список переменных окружения.

## Интеграция компонентов
- Worker продолжает опираться на `/api/admin/settings` и не запускает цикл при `session_stop_enabled=true`.
- Сервер гарантирует, что после cold start `session_stop_enabled` возвращается как `true`, даже если ранее было `false`.

## Тест-кейсы
### End-to-end тесты
1. **TC-CS-30.1-01:** После деплоя/cold start без admin start цикл не запускается, бюджет не расходуется.
2. **TC-CS-30.1-02:** После нажатия "Start research" цикл запускается автоматически.
3. **TC-CS-30.1-03:** Пользовательский insertion (guided question/intervention) запускает один цикл даже в paused состоянии.

## Критерии приёмки
- [ ] Автозапуск без admin start отсутствует после cold start.
- [ ] Admin start возобновляет публичный цикл.
- [ ] User insertions работают в paused состоянии.
- [ ] Документация и env-переменные обновлены.

## Примечания
- Использовать `updated_at` и время старта процесса для определения "старой" настройки.
