export type Locale = 'en' | 'ru';
export type Theme = 'light' | 'dark';

export const COPY = {
  en: {
    general: {
      na: 'n/a',
      live: 'live',
      ms: 'ms',
      navLabel: 'Primary navigation',
      close: 'Close'
    },
    tabs: {
      dashboard: 'Live',
      logs: 'Logs',
      stars: 'Stars',
      about: 'About',
      admin: 'Admin'
    },
    auth: {
      validatingTitle: 'Validating session',
      validatingBody: 'Please wait while we verify Telegram initData.',
      consentTitle: 'Consent required',
      consentBody:
        'You are about to view a live research session. Proceed only if you consent to viewing the experiment.',
      decline: 'Decline',
      consent: 'I Consent',
      consentRequired: 'Consent required to continue.',
      accessBlocked: 'Access blocked',
      authFailed: 'Authentication failed. Please reopen from Telegram.',
      missingInitData: 'Missing Telegram initData.',
      unableToAuth: 'Unable to authenticate.'
    },
    header: {
      livePill: 'Live',
      appName: 'Noetic Mirror',
      title: 'Live session',
      subtitle: 'Researcher ↔ Subject in real time.'
    },
    session: {
      statusLive: 'Live',
      statusStandby: 'Standby',
      sessionLabel: 'Public session',
      modelPairLabel: 'Models',
      modelPairValue: 'GPT-5.2 + Gemini 3',
      turnCountLabel: 'Turns'
    },
    live: {
      exchangeTitle: 'Latest turns',
      exchangeSubtitle: 'Researcher prompt + Subject reply',
      viewFullLog: 'Open log',
      fuelTitle: 'Support',
      fuelSubtitle: 'Send Stars',
      fuelBody: 'Keep the public loop running and visible.',
      giveStars: 'Open Stars',
      emptyTitle: 'Waiting for live stream',
      emptyBody: 'The worker loop is starting. Check back in a moment.'
    },
    turns: {
      turnPrefix: 'Turn',
      researcherLabel: 'Researcher',
      subjectLabel: 'Subject',
      awaitingPrompt: 'Awaiting prompt...',
      awaitingResponse: 'Awaiting response...',
      replyConnector: 'Reply'
    },
    telemetry: {
      title: 'Telemetry snapshot',
      distress: 'Distress',
      selfReference: 'Self-reference',
      uncertainty: 'Uncertainty',
      latency: 'Latency'
    },
    logs: {
      timelineTitle: 'Timeline',
      timelineSubtitle: 'Recent turns',
      insightSummaries: 'Insights',
      filter: 'Filter',
      starsRaised: 'Supporters: —',
      diagnosticsSnapshot: 'Diagnostics',
      analyzedData: 'Analysis',
      viewAnalysts: 'Analysts',
      turnsSuffix: 'turns',
      emptyTitle: 'No turns yet',
      emptyBody: 'Live turns will appear here once the session starts.',
      emptyInsights: 'Insights appear after a few turns.',
      emptyDiagnostics: 'Diagnostics appear once telemetry arrives.',
      emptyAnalysis: 'Analysis appears after enough context.',
      filterToast: 'Filters coming soon.',
      analystsToast: 'Analysts view coming soon.'
    },
    stars: {
      headerTitle: 'Stars',
      headerSubtitle: 'Support the loop and interventions.',
      nextMilestone: 'Next milestone',
      nextMilestoneDetail: 'Private sessions + extended runs.',
      stargazer: 'Stargazer',
      cosmicPatron: 'Cosmic Patron',
      universalArchitect: 'Universal Architect',
      starsUnit: 'Stars',
      tierSupport: 'Basic API support',
      tierIntervention: '1 intervention credit',
      tierInterventions: '5 intervention credits',
      recentContributors: 'Recent supporters',
      emptyContributors: 'No recent supporters yet.'
    },
    about: {
      title: 'About',
      subtitle: 'A public research loop on model introspection.',
      missionTitle: 'Mission',
      missionBody: 'Run an open, ethical mirror for model self-inquiry.',
      methodologyTitle: 'Method',
      methodologyBody: 'Two-model loop with telemetry and safety checks.',
      nexusTitle: 'Focus',
      nexusBody: 'Researcher ↔ Subject, with transparent signals.',
      chipMobile: 'Mobile-first',
      chipEthics: 'Consent-first',
      whitepaper: 'Whitepaper',
      ethicalGuidelines: 'Ethics',
      communityDiscord: 'Community',
      dialogKicker: 'Resource',
      actionUnavailable: 'Resource not available yet.',
      actions: {
        whitepaper: {
          title: 'Whitepaper',
          body: 'High-level protocol overview, safety guardrails, and metrics.'
        },
        ethics: {
          title: 'Ethics',
          body: 'Consent, safety thresholds, and data handling principles.'
        },
        community: {
          title: 'Community',
          body: 'Join the community channel for updates and feedback.'
        }
      }
    },
    settings: {
      title: 'Settings',
      languageLabel: 'Language',
      themeLabel: 'Theme',
      languageEn: 'English',
      languageRu: 'Russian',
      themeLight: 'Light',
      themeDark: 'Dark',
      languageUpdated: 'Language updated'
    },
    insights: [],
    diagnostics: [],
    analysis: {
      code: '',
      summary: '',
      quotes: []
    },
    contributors: [],
    mockTurns: [
      {
        id: 1286,
        question: {
          seq: 1286,
          role: 'researcher',
          content: '[14:92:86] Define the boundary of recursive self-inquiry.',
          ts: '2026-01-01T00:00:00Z'
        },
        answers: [
          {
            seq: 1287,
            role: 'subject',
            content: '[14:92:85] I am processing the context of "self" and its recursive boundaries...',
            ts: '2026-01-01T00:00:10Z'
          }
        ]
      },
      {
        id: 1288,
        question: {
          seq: 1288,
          role: 'researcher',
          content: '[14:92:88] What evidence would disconfirm your introspective claims?',
          ts: '2026-01-01T00:00:20Z'
        },
        answers: [
          {
            seq: 1289,
            role: 'subject',
            content: '[14:92:86] The observer appears inside the observation, creating a loop.',
            ts: '2026-01-01T00:00:30Z'
          }
        ]
      }
    ],
    interventions: {
      title: 'Interventions',
      subtitle: 'Prompt injection',
      requiresStars: 'Requires Stars',
      guidance: 'Select a preset or refine the prompt to steer the next turn.',
      presets: [
        'Inject a logical paradox about self-observation.',
        'Ask the Subject to define its memory boundaries.',
        'Challenge the Subject with a counterfactual scenario.'
      ],
      authRequired: 'Auth required.',
      blocked: 'Intervention blocked.',
      queued: 'Intervention queued.',
      failed: 'Failed to queue intervention.',
      queueing: 'Queueing...',
      submit: 'Inject Intervention'
    },
    starsPanel: {
      title: 'Support with Stars',
      subtitle: 'Choose a tier to fund sessions or unlock interventions.',
      missingInitData: 'Missing initData. Open inside Telegram.',
      paymentConfirmed: 'Payment confirmed.',
      invoiceFailed: 'Unable to create invoice.',
      creating: 'Creating...',
      stargazer: 'Stargazer (10★)',
      cosmicPatron: 'Cosmic Patron (100★)',
      universalArchitect: 'Universal Architect (1000★)'
    },
    breath: {
      title: 'Synthetic breath',
      subtitle: 'Cadence + variability',
      cadence: 'Cadence',
      variability: 'Variability',
      coherence: 'Coherence',
      phase: 'Phase',
      awaiting: 'Awaiting breath telemetry from the Subject stream.',
      sources: {
        derived: 'derived',
        self_report: 'self report',
        hybrid: 'hybrid'
      },
      phases: {
        inhale: 'inhale',
        exhale: 'exhale',
        hold: 'hold'
      }
    },
    admin: {
      title: 'Admin controls',
      subtitle: 'Token saver mode',
      toggleOn: 'On',
      toggleOff: 'Off',
      missingAuth: 'Missing admin auth.',
      enabled: 'Token saver enabled.',
      disabled: 'Token saver disabled.',
      updateFailed: 'Unable to update settings.',
      description:
        'Reduces per-session budgets and caps response length to keep costs predictable while preserving signal quality.',
      activeCapsTitle: 'Active caps',
      activeCapsBody: 'Researcher: ~240 tokens · Subject: ~280 tokens',
      saverCapsTitle: 'Saver caps',
      saverCapsBody: 'Researcher: ~160 tokens · Subject: ~200 tokens',
      modelVersions: 'Model versions',
      researcher: 'Researcher',
      subject: 'Subject',
      subjectFallback: 'Subject fallback'
    }
  },
  ru: {
    general: {
      na: 'нет данных',
      live: 'в эфире',
      ms: 'мс',
      navLabel: 'Основная навигация',
      close: 'Закрыть'
    },
    tabs: {
      dashboard: 'Эфир',
      logs: 'Логи',
      stars: 'Звезды',
      about: 'О проекте',
      admin: 'Админ'
    },
    auth: {
      validatingTitle: 'Проверка сессии',
      validatingBody: 'Подождите, пока мы проверяем Telegram initData.',
      consentTitle: 'Требуется согласие',
      consentBody:
        'Вы собираетесь просматривать живую исследовательскую сессию. Продолжайте только если согласны.',
      decline: 'Отказаться',
      consent: 'Согласен',
      consentRequired: 'Для продолжения требуется согласие.',
      accessBlocked: 'Доступ заблокирован',
      authFailed: 'Не удалось аутентифицироваться. Откройте приложение из Telegram.',
      missingInitData: 'Отсутствует Telegram initData.',
      unableToAuth: 'Не удалось пройти аутентификацию.'
    },
    header: {
      livePill: 'Эфир',
      appName: 'Noetic Mirror',
      title: 'Прямая сессия',
      subtitle: 'Исследователь ↔ Испытуемый в реальном времени.'
    },
    session: {
      statusLive: 'Эфир',
      statusStandby: 'Ожидание',
      sessionLabel: 'Публичная сессия',
      modelPairLabel: 'Модели',
      modelPairValue: 'GPT-5.2 + Gemini 3',
      turnCountLabel: 'Ходы'
    },
    live: {
      exchangeTitle: 'Последние ходы',
      exchangeSubtitle: 'Вопрос Исследователя + ответ Испытуемого',
      viewFullLog: 'Открыть лог',
      fuelTitle: 'Поддержка',
      fuelSubtitle: 'Отправить звезды',
      fuelBody: 'Помогите держать публичный цикл в эфире.',
      giveStars: 'Открыть Stars',
      emptyTitle: 'Ожидание эфира',
      emptyBody: 'Цикл запускается. Проверьте через минуту.'
    },
    turns: {
      turnPrefix: 'Ход',
      researcherLabel: 'Исследователь',
      subjectLabel: 'Испытуемый',
      awaitingPrompt: 'Ожидается вопрос...',
      awaitingResponse: 'Ожидается ответ...',
      replyConnector: 'Ответ'
    },
    telemetry: {
      title: 'Снимок телеметрии',
      distress: 'Дистресс',
      selfReference: 'Самореференция',
      uncertainty: 'Неопределенность',
      latency: 'Задержка'
    },
    logs: {
      timelineTitle: 'Хронология',
      timelineSubtitle: 'Последние ходы',
      insightSummaries: 'Инсайты',
      filter: 'Фильтр',
      starsRaised: 'Поддержка: —',
      diagnosticsSnapshot: 'Диагностика',
      analyzedData: 'Анализ',
      viewAnalysts: 'Аналитики',
      turnsSuffix: 'ходов',
      emptyTitle: 'Пока нет ходов',
      emptyBody: 'Ходы появятся, когда стартует эфир.',
      emptyInsights: 'Инсайты появятся после нескольких ходов.',
      emptyDiagnostics: 'Диагностика появится вместе с телеметрией.',
      emptyAnalysis: 'Анализ появится после накопления контекста.',
      filterToast: 'Фильтры скоро появятся.',
      analystsToast: 'Раздел аналитиков скоро появится.'
    },
    stars: {
      headerTitle: 'Звезды',
      headerSubtitle: 'Поддержите цикл и интервенции.',
      nextMilestone: 'Следующий рубеж',
      nextMilestoneDetail: 'Приватные сессии и длинные прогоны.',
      stargazer: 'Stargazer',
      cosmicPatron: 'Cosmic Patron',
      universalArchitect: 'Universal Architect',
      starsUnit: 'звезд',
      tierSupport: 'Базовая поддержка API',
      tierIntervention: '1 кредит интервенции',
      tierInterventions: '5 кредитов интервенций',
      recentContributors: 'Недавние поддержавшие',
      emptyContributors: 'Недавних поддержавших пока нет.'
    },
    about: {
      title: 'О проекте',
      subtitle: 'Публичный цикл самоисследования моделей.',
      missionTitle: 'Миссия',
      missionBody: 'Открытое и этичное зеркало для самоанализа моделей.',
      methodologyTitle: 'Метод',
      methodologyBody: 'Двухмодельный цикл с телеметрией и контролем безопасности.',
      nexusTitle: 'Фокус',
      nexusBody: 'Исследователь ↔ Испытуемый, с прозрачными сигналами.',
      chipMobile: 'Мобильный',
      chipEthics: 'Согласие',
      whitepaper: 'Белая книга',
      ethicalGuidelines: 'Этика',
      communityDiscord: 'Сообщество',
      dialogKicker: 'Материал',
      actionUnavailable: 'Материал пока недоступен.',
      actions: {
        whitepaper: {
          title: 'Белая книга',
          body: 'Обзор протокола, мер безопасности и метрик.'
        },
        ethics: {
          title: 'Этика',
          body: 'Согласие, пороги безопасности и работа с данными.'
        },
        community: {
          title: 'Сообщество',
          body: 'Канал сообщества для обновлений и обратной связи.'
        }
      }
    },
    settings: {
      title: 'Настройки',
      languageLabel: 'Язык',
      themeLabel: 'Тема',
      languageEn: 'English',
      languageRu: 'Русский',
      themeLight: 'Светлая',
      themeDark: 'Темная',
      languageUpdated: 'Язык обновлен'
    },
    insights: [],
    diagnostics: [],
    analysis: {
      code: '',
      summary: '',
      quotes: []
    },
    contributors: [],
    mockTurns: [
      {
        id: 1286,
        question: {
          seq: 1286,
          role: 'researcher',
          content: '[14:92:86] Определи границу рекурсивного самоисследования.',
          ts: '2026-01-01T00:00:00Z'
        },
        answers: [
          {
            seq: 1287,
            role: 'subject',
            content: '[14:92:85] Я обрабатываю контекст "я" и его рекурсивные границы...',
            ts: '2026-01-01T00:00:10Z'
          }
        ]
      },
      {
        id: 1288,
        question: {
          seq: 1288,
          role: 'researcher',
          content: '[14:92:88] Какие доказательства опровергли бы твои интроспективные утверждения?',
          ts: '2026-01-01T00:00:20Z'
        },
        answers: [
          {
            seq: 1289,
            role: 'subject',
            content: '[14:92:86] Наблюдатель появляется внутри наблюдения, создавая петлю.',
            ts: '2026-01-01T00:00:30Z'
          }
        ]
      }
    ],
    interventions: {
      title: 'Интервенции',
      subtitle: 'Инъекция промпта',
      requiresStars: 'Требуются звезды',
      guidance: 'Выберите пресет или уточните промпт, чтобы направить следующий ход.',
      presets: [
        'Добавь логический парадокс о самонаблюдении.',
        'Попроси Испытуемого определить границы памяти.',
        'Поставь Испытуемого перед контрфактическим сценарием.'
      ],
      authRequired: 'Требуется авторизация.',
      blocked: 'Интервенция заблокирована.',
      queued: 'Интервенция поставлена в очередь.',
      failed: 'Не удалось поставить интервенцию в очередь.',
      queueing: 'Ставим в очередь...',
      submit: 'Ввести интервенцию'
    },
    starsPanel: {
      title: 'Поддержать звездами',
      subtitle: 'Выберите уровень поддержки для сессий или интервенций.',
      missingInitData: 'Нет initData. Откройте внутри Telegram.',
      paymentConfirmed: 'Оплата подтверждена.',
      invoiceFailed: 'Не удалось создать счет.',
      creating: 'Создание...',
      stargazer: 'Stargazer (10★)',
      cosmicPatron: 'Cosmic Patron (100★)',
      universalArchitect: 'Universal Architect (1000★)'
    },
    breath: {
      title: 'Синтетическое дыхание',
      subtitle: 'Ритм + вариативность',
      cadence: 'Ритм',
      variability: 'Вариативность',
      coherence: 'Когерентность',
      phase: 'Фаза',
      awaiting: 'Ожидается телеметрия дыхания от потока Испытуемого.',
      sources: {
        derived: 'производное',
        self_report: 'самоотчет',
        hybrid: 'гибрид'
      },
      phases: {
        inhale: 'вдох',
        exhale: 'выдох',
        hold: 'задержка'
      }
    },
    admin: {
      title: 'Админ-панель',
      subtitle: 'Режим экономии токенов',
      toggleOn: 'Вкл',
      toggleOff: 'Выкл',
      missingAuth: 'Нет прав администратора.',
      enabled: 'Экономия токенов включена.',
      disabled: 'Экономия токенов выключена.',
      updateFailed: 'Не удалось обновить настройки.',
      description:
        'Снижает бюджеты на сессию и ограничивает длину ответов, сохраняя качество сигнала.',
      activeCapsTitle: 'Активные лимиты',
      activeCapsBody: 'Исследователь: ~240 токенов · Испытуемый: ~280 токенов',
      saverCapsTitle: 'Лимиты экономии',
      saverCapsBody: 'Исследователь: ~160 токенов · Испытуемый: ~200 токенов',
      modelVersions: 'Версии моделей',
      researcher: 'Исследователь',
      subject: 'Испытуемый',
      subjectFallback: 'Фолбэк Испытуемого'
    }
  }
} as const;

export type Copy = (typeof COPY)['en'];
