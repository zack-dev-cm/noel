# Задача 14.2: Researcher/Subject prompt tuning + language enforcement

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-09: Configure language mode and theme

## Цель задачи
Сделать системные промпты компактными и релевантными, а также гарантировать ответы моделей на выбранном языке (EN/RU).

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/worker/src/openai/client.ts`
- Обновить system prompt для Researcher: 1 короткий вопрос, без преамбулы и нерелевантных деталей.
- Явно требовать ответы на выбранном языке.

#### Файл: `apps/worker/src/gemini/context.ts`
- Обновить заголовок для Subject, зафиксировать язык ответа.

#### Файл: `apps/worker/src/runner.ts`
- Уточнить дефолтный initial prompt для EN/RU (короче и фокуснее).

#### Файл: `infra/gcp/deploy.sh`
- При необходимости скорректировать лимиты токенов/символов для более коротких ответов.

## Тест-кейсы

### Юнит
1. **TC-UNIT-14.2-01:** RU mode задаёт RU system prompt и RU header.

### Регрессионные
- Playwright E2E (см. задачу 14.4).

## Критерии приёмки
- [ ] Researcher формирует короткие релевантные вопросы.
- [ ] Subject и Researcher отвечают на выбранном языке (EN/RU).
- [ ] Лимиты вывода соответствуют компактной форме ответов.
