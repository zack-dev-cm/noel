# Задача 29.1: README + screenshots + public project description

## Связь с юзер-кейсами
- UC-16: Open-source repository onboarding

## Цель задачи
Подготовить публичный README с описанием проекта, ключевыми возможностями, архитектурными ссылками и быстрым стартом, включая один утверждённый скриншот.

## Описание изменений

### Новые файлы
- `README.md` — публичное описание проекта и быстрый старт.

### Изменения в существующих файлах

#### Файл: `docs/` (новая подпапка для скриншотов)
- Добавить `docs/images/` (если ещё нет) и поместить выбранный скриншот из `Photos-3-001 2/` с безопасным именем (ASCII, без пробелов).

#### Файл: `README.md`
- Добавить разделы:
  - Project summary (1–2 абзаца)
  - Key features (маркерованный список)
  - Architecture links (ссылки на `PRD.md`, `ARCHITECTURE.md`, `DEV_PLAN.md`)
  - Quickstart (установка, `.env.example`, `npm install`, `npm run dev`)
  - Runbooks (ссылки на `docs/runbooks/deploy.md` и `docs/runbooks/ops.md`)
  - License / Contributing / Security / Code of Conduct (ссылки на соответствующие файлы)
- Вставить выбранный скриншот в README (Markdown image), используя относительный путь `docs/images/<screenshot>.png|.jpg`.
- Указать, что для полноценного продового E2E нужен валидный `PLAYWRIGHT_INIT_DATA`.

## Тест-кейсы
- Автотесты не требуются (документация).

## Критерии приёмки
- [ ] README содержит краткое описание, фичи, quickstart и ссылки на ключевые документы.
- [ ] В README встроен минимум один скриншот из `Photos-3-001 2/`.
- [ ] Ссылки на runbooks и governance-документы присутствуют.

## Примечания
- Скриншот выбрать вместе с владельцем репозитория (см. open_questions).
