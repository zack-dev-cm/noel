# Задача 16.1: Subject retry (same model) + length targets + output completeness logging

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-08: Subject breath telemetry

## Цель задачи
Устранить пост-генерационную обрезку ответов и добавить диагностическое логирование длины ответов, сохранив текущую логику ретраев/фоллбэков.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/worker/src/openai/client.ts`
- Убрать пост-обрезку ответа (truncateText); оставлять полный `output_text`.
- Логировать длину ответа, лимиты и признак превышения char-cap (уровень `debug`).

#### Файл: `apps/worker/src/gemini/client.ts`
- Убрать пост-обрезку ответа; использовать только `maxOutputTokens` как лимит модели.
- Добавить расчёт `over_char_cap` (если `maxOutputChars` задан) и включить его в `subject_response`.
- Сохранить текущую логику empty-response и fallback без изменений.

#### Файл: `apps/worker/src/runner.ts`
- Оставить передачу `maxOutputChars`/`maxOutputTokens` для диагностического логирования.

#### Файл: `docs/runbooks/ops.md`
- Добавить пример фильтра/запроса логов по `researcher_response` и `subject_response` с `over_char_cap`.

## Тест-кейсы

### Интеграционные тесты
1. **TC-INT-16.1-01:** Ответ длиннее `maxOutputChars` публикуется полностью; в логах `over_char_cap=true`.
2. **TC-INT-16.1-02:** Пустой Subject-ответ фиксируется логом и запускает fallback, как ранее.

### Регрессионные тесты
- Playwright E2E (см. задачу 16.4).

## Критерии приёмки
- [ ] Researcher/Subject ответы не обрезаются после генерации.
- [ ] Логи содержат длину ответа и флаг превышения char-cap.
- [ ] Поведение empty-response fallback сохранено.
