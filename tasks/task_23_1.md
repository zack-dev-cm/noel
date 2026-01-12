# Задача 23.1: Logs cleanup + newest-first ordering + admin stop toggle

## Связь с юзер-кейсами
- UC-06: Operator safety controls
- UC-07: Session replay and resume

## Цель задачи
Очистить лог-ленту от неполных пар, показывать самые свежие пары сверху, добавить clear-history контроль и админскую кнопку Stop.

## Описание изменений

### Новые файлы
- `migrations/006_admin_stop_control.sql` — добавить stop-флаг в admin_settings.

### Изменения в существующих файлах
- `apps/web/src/App.tsx` — фильтрация неполных пар, reverse ordering, кнопка очистки логов.
- `apps/web/src/i18n.ts` — тексты для clear logs и stop button.
- `apps/web/src/components/AdminPanel.tsx` — stop button и статус.
- `apps/server/src/routes/admin.ts` — поддержка stop-флага в GET/POST.
- `apps/worker/src/admin/settings.ts` — чтение stop-флага.
- `apps/worker/src/runner.ts` — уважать stop-флаг (не запускать новый цикл).
- `packages/shared/src/storage.ts` — расширение AdminSettingsRecord.
- `apps/server/src/storage/in_memory/adminRepository.ts` — хранение stop-флага.
- `apps/server/src/storage/postgres/index.ts` — чтение/обновление stop-флага.

## Детали по реализации
- UI логи: показывать только пары с исследователем + ответом Испытуемого.
- Логи: сортировать newest-first.
- Clear history: сбрасывать лог-ленту до текущего seq без удаления в БД.
- Admin stop: toggle/button, запрещающий новые ходы (worker пропускает тик).

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-23.1-01:** Логи показывают только завершенные пары и newest-first.
2. **TC-E2E-23.1-02:** Clear logs очищает историю (только новые пары видны).
3. **TC-E2E-23.1-03:** Admin stop блокирует новый ход.

### Регрессионные тесты
- `npx playwright test --headed` (при необходимости).

## Критерии приёмки
- [ ] Логи не показывают неполные пары.
- [ ] Самые новые пары отображаются первыми.
- [ ] Clear logs скрывает историю без удаления данных.
- [ ] Stop control доступен только админам и останавливает новые ходы.
