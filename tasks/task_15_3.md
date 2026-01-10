# Задача 15.3: Admin username access + budget caps + model update

## Связь с юзер-кейсами
- UC-06: Operator safety controls
- UC-11: Admin configuration and usage analytics

## Цель задачи
Разрешить админ-доступ по Telegram username, обновить дефолтную модель Researcher и ввести жёсткие бюджетные лимиты.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/server/src/routes/auth.ts`
- Признавать админа по списку `ADMIN_TELEGRAM_IDS`, принимающему ID или username.

#### Файл: `apps/server/src/routes/admin.ts`
- Разрешить доступ по username из списка админов.
- Отображать актуальную модель Researcher (`gpt-5.2-2025-12-11`).

#### Файл: `apps/worker/src/openai/usageTracker.ts`
- Добавить счётчик запросов и проверку лимита на уровне сессии.

#### Файл: `apps/worker/src/runner.ts`
- Применить лимит 40 запросов или $0.10 (configurable env) и завершать сессии при превышении.
- Обновить дефолт Researcher модель на `gpt-5.2-2025-12-11`.

#### Файл: `infra/gcp/deploy.sh`
- Обновить модель Researcher и бюджетные значения по умолчанию.

#### Файл: `docs/runbooks/deploy.md`
- Зафиксировать новые env переменные и лимиты.

## Тест-кейсы

### E2E
1. **TC-E2E-15.3-01:** Admin таб доступен при username в списке админов.

### Регрессионные
- Проверить, что лимиты бюджета не ломают единичные прогоны.

## Критерии приёмки
- [ ] Админ-доступ работает для Telegram username (например `rheuiii`).
- [ ] Researcher использует `gpt-5.2-2025-12-11` по умолчанию.
- [ ] Сессия останавливается при $0.10 или 40 запросах.
