# Задача 16.4: Playwright + deploy/debug loop for replies/metrics/tags

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-07: Reconnect and replay
- UC-08: Subject breath telemetry
- UC-12: Mobile-native UI

## Цель задачи
Подтвердить исправления по полноте ответов, телеметрии и model tags через E2E, затем выполнить deploy/debug loop до чистого результата.

## Описание изменений

### Действия
- Запустить Playwright в headed режиме и визуально проверить скриншоты/трейсы.
- Выполнить deploy (web + worker) через `infra/gcp/deploy.sh`.
- Проверить логи Cloud Run на `subject_response`, `researcher_response`, `over_char_cap`.
- При ошибках: исправить, повторно задеплоить и заново прогнать E2E.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-16.4-01:** Live/Logs показывают полный текст ответов без обрезки.
2. **TC-E2E-16.4-02:** Метрики (включая breath) отображаются при наличии telemetry.
3. **TC-E2E-16.4-03:** Model tags отображаются в карточках.

### Регрессионные тесты
- Полный набор Playwright тестов.

## Критерии приёмки
- [ ] Playwright (headed) проходит, скриншоты/трейсы просмотрены.
- [ ] Deploy -> E2E -> debug -> redeploy выполнен без ошибок.
- [ ] В логах присутствуют события ответов с корректными полями.
