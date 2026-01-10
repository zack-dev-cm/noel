# Задача 12.3: WebApp language/theme toggles + localization

## Связь с юзер-кейсами
- UC-09: Configure language mode and theme

## Цель задачи
Добавить в WebApp переключатели языка (EN/RU) и темы (light/dark), локализовать весь пользовательский текст и синхронизировать настройки с API.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/web/src/App.tsx`
- Ввести состояние `locale` и `theme` (с чтением из API/LocalStorage).
- Добавить UI для переключателей языка и темы в разделе About.
- Вызывать `/api/user/preferences` и `/api/sessions/:id/settings` при изменении языка.
- Применять тему через `document.documentElement.dataset.theme`.
- Использовать локализованные строки (через общий словарь).

#### Файл: `apps/web/src/index.css`
- Добавить CSS-переменные и фон для темной темы (`:root[data-theme='dark']`).
- Обновить `color-scheme` и фоновые эффекты для dark mode.

#### Файлы компонентов:
- `apps/web/src/components/Interventions.tsx`
- `apps/web/src/components/StarsPanel.tsx`
- `apps/web/src/components/BreathWidget.tsx`
- `apps/web/src/components/AdminPanel.tsx`
- Обновить тексты, используя локализованный словарь (пропсы или общий хук).

#### Новый файл: `apps/web/src/i18n.ts`
- Общий словарь строк для EN/RU.
- Типизированные ключи для повторно используемых меток и описаний.

## Интеграция компонентов
- `App.tsx` хранит `locale/theme` и передает `copy` в дочерние компоненты.
- После `auth/init` UI получает предпочтения и применяет локаль/тему.

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-12.3-01:** Переключение языка отображает RU-тексты в UI.
2. **TC-E2E-12.3-02:** Переключение темы меняет `data-theme` на `dark`.

### Регрессионные тесты
- Запустить Playwright E2E suite.

## Критерии приёмки
- [ ] В UI есть переключатели языка и темы.
- [ ] Все пользовательские тексты локализованы для EN и RU.
- [ ] Выбор языка влияет на последующие turn-ы (через API сессии).
- [ ] Выбор темы сохраняется и применяется без перезагрузки.
