# Задача 7.2: GitHub Actions (lint/test/e2e/deploy)

## Связь с юзер-кейсами
- UC-02: Observe a live public session

## Цель задачи
Добавить CI pipeline: lint/unit/e2e + deploy (staging/prod).

## Описание изменений

### Новые файлы
- `.github/workflows/ci.yml` — pipeline с шагами lint/test/build/e2e/deploy.

### Изменения в существующих файлах
- Нет.

### Детали по компонентам
- Workflow должен:
  - Установить зависимости.
  - Запустить unit tests.
  - Запустить Playwright (headed в CI с xvfb).
  - При успехе — деплой в staging.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-15:** CI run
   - Ожидаемый результат: workflow проходит без ошибок.

### Модульные тесты
- Нет.

### Регрессионные тесты
- Все Playwright тесты.

## Критерии приёмки
- [ ] Workflow запускается на push.
- [ ] Есть шаги для e2e и deploy.

## Примечания
- Для прод деплоя использовать manual approval.
