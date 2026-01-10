# Задача 11.1: Mobile-native UI, turn pairing, bottom navigation

## Связь с юзер-кейсами
- UC-02: Observe a live public session
- UC-07: Session replay and resume
- UC-12: Mobile navigation and readable turn pairing

## Цель задачи
Переработать UI на mobile-native карточный стиль, добавить явное связывание реплик Researcher/Subject, обновить нижнюю навигацию, сохранив текущую функциональность потоков и панели действий.

## Описание изменений

### Изменения в существующих файлах

#### Файл: `apps/web/src/App.tsx`
- Обновить layout под mobile-first карточный UI (hero + live turns + metrics).
- Добавить логику группировки событий в пары "prompt → reply" (turns).
- Рендерить Researcher prompt и Subject reply внутри одного turn card.
- Заменить табы на нижний таб-бар с иконками (Live, Logs, Stars, About, Admin для операторов).
- Обновить копирайтинг и метки (с акцентом на читаемость и ясное соответствие вопрос/ответ).

#### Файл: `apps/web/src/index.css`
- Ввести новые CSS variables для светлой, mobile-native темы.
- Обновить базовые классы (`panel`, `chip`, `pill`, `metric`, `input-field`, `nav`) под новую визуальную систему.
- Добавить стили для turn cards и соединителей (prompt → reply).
- Обновить фоновые эффекты (градиенты/формы) под новую палитру.

#### Файл: `apps/web/src/components/Interventions.tsx`
- Обновить классы кнопок и текста под новую систему карточек/кнопок.

#### Файл: `apps/web/src/components/StarsPanel.tsx`
- Обновить классы кнопок и текста под новую систему карточек/кнопок.

#### Файл: `apps/web/src/components/BreathWidget.tsx`
- Обновить текстовые стили и обертку под новый дизайн.
- Сохранить data-testid поля для Playwright.

#### Файл: `apps/web/src/components/AdminPanel.tsx`
- Обновить классы панели и текста под новый дизайн.

#### Файл: `tests/e2e/onboarding.spec.ts`
- Обновить ожидания по названиям табов и базовым заголовкам.

#### Файл: `tests/e2e/stream.spec.ts`
- Обновить ожидания по меткам парных реплик (Researcher prompt / Subject reply).

#### Файл: `tests/e2e/streaming.spec.ts`
- Обновить ожидания по меткам парных реплик (Researcher prompt / Subject reply).

## Интеграция компонентов
- Использовать `useStream` как источник событий и преобразовывать в структуру turns внутри `App.tsx`.
- Сохранить текущие API-интеграции (auth/init, payments, interventions).

## Тест-кейсы

### End-to-end тесты
1. **TC-E2E-11.1-01:** Dashboard отображает tab-bar и Live экран
   - Входные данные: stub Telegram initData
   - Ожидаемый результат: видны кнопки Live/Logs/Stars/About
2. **TC-E2E-11.1-02:** Live turns показывают парные метки
   - Входные данные: mock stream events
   - Ожидаемый результат: видны тексты "Researcher prompt" и "Subject reply"

### Модульные тесты
- Не требуются (UI-only изменения).

### Регрессионные тесты
- Запустить Playwright E2E suite.

## Критерии приёмки
- [ ] Нижняя навигация отображается на всех основных вкладках.
- [ ] Реплики Researcher и Subject отображаются как один turn card с явной связью.
- [ ] Визуальный стиль соответствует mobile-native карточной системе.
- [ ] Playwright E2E тесты обновлены и проходят.
- [ ] Документация по дизайну и статус обновлены при необходимости.

## Примечания
- Не менять API контракты и бизнес-логику.
- Сохранять data-testid атрибуты для существующих тестов.
