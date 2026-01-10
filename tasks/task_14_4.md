# Задача 14.4: Playwright + deploy debug loop for live Subject replies

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-09: Configure language mode and theme

## Цель задачи
Проверить UI/UX и live Subject ответы после изменений: локально и в проде.

## Описание изменений

### Изменения в существующих файлах

#### Файлы: `tests/e2e/*.spec.ts`
- Обновить проверки по новым текстам и действиям.

#### Файлы: `docs/runbooks/ops.md`, `docs/runbooks/deploy.md`
- Уточнить шаги для проверки worker логов и Subject пайплайна.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-14.4-01:** Subject reply отображается непустым.
2. **TC-E2E-14.4-02:** Переключение языка/темы работает.
3. **TC-E2E-14.4-03:** About actions дают реакцию.

### Релизный цикл
- Запустить local Playwright (headed) + визуальная проверка.
- Деплой через `infra/gcp/deploy.sh`.
- Запустить Playwright против проды + визуальная проверка.
- Проверить Cloud Logging по событиям Subject.

## Критерии приёмки
- [ ] Playwright локально и в проде проходит.
- [ ] В логах есть `subject_request`/`subject_response`.
- [ ] UI/UX и кнопки работают в проде.
