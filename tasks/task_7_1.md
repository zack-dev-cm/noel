# Задача 7.1: Docker/Cloud Build, deploy script, runbooks

## Связь с юзер-кейсами
- UC-02: Observe a live public session

## Цель задачи
Добавить Docker/Cloud Build конфигурацию, deploy скрипт GCP и обновить runbooks (deploy/ops).

## Описание изменений

### Новые файлы
- `Dockerfile` — multi-stage build (web + server + worker).
- `infra/gcp/cloudbuild.yaml` — билд и пуш образа.
- `infra/gcp/deploy.sh` — деплой в Cloud Run (web + worker).

### Изменения в существующих файлах
- `docs/runbooks/deploy.md` — шаги деплоя, vars, secrets.
- `docs/runbooks/ops.md` — проверки после деплоя.

### Детали по компонентам

#### Deploy script
- Использовать проект/регион из gcloud config (по умолчанию `energy-meters`, `us-east1`).
- Устанавливать concurrency=1 для worker, concurrency>1 для web.
- Использовать Secret Manager для `OPENAI_API_KEY`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-14:** Deploy dry-run (staging)
   - Ожидаемый результат: Cloud Run service доступен по URL.

### Модульные тесты
- Нет.

### Регрессионные тесты
- `npx playwright test --headed` (после деплоя).

## Критерии приёмки
- [ ] Добавлены Dockerfile и Cloud Build конфиг.
- [ ] Deploy script работает с Cloud Run.
- [ ] Runbooks описывают реальные шаги.

## Примечания
- Секреты хранятся только в Secret Manager.
