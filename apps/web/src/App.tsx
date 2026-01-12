import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import WebApp from '@twa-dev/sdk';
import AdminPanel from './components/AdminPanel';
import BreathWidget from './components/BreathWidget';
import GuidedQuestions from './components/GuidedQuestions';
import Interventions from './components/Interventions';
import StarsPanel from './components/StarsPanel';
import { useStream, type StreamEvent } from './hooks/useStream';
import { getTelegramInitData } from './hooks/useTelegram';
import { COPY, type Copy, type Locale, type Theme } from './i18n';

type TabKey = 'dashboard' | 'logs' | 'stars' | 'about' | 'admin';
type AboutActionKey = 'whitepaper' | 'ethics' | 'community';

type BreathTelemetry = {
  bpm: number;
  variability: number;
  coherence: number;
  phase: 'inhale' | 'exhale' | 'hold';
  source: 'derived' | 'self_report' | 'hybrid';
};

type Telemetry = {
  distress_score: number;
  self_ref_rate: number;
  uncertainty: number;
  latency_ms: number;
  breath?: BreathTelemetry;
};

type TranscriptResponse = {
  ok: boolean;
  items?: StreamEvent[];
  next_cursor?: string | null;
};

type Turn = {
  id: number;
  question?: StreamEvent;
  answers: StreamEvent[];
};

type BuildTurnsOptions = {
  includeLatestIncomplete?: boolean;
};

const stagger = (index: number) => ({ '--delay': `${index * 90}ms` } as CSSProperties);

const formatMetric = (value: number | undefined, unit = '', fallback = 'n/a') => {
  if (typeof value !== 'number') return fallback;
  if (unit === 'ms' || unit === 'мс') return `${Math.round(value)}${unit}`;
  return `${value.toFixed(2)}${unit}`;
};

const formatTimestamp = (ts: string | undefined, locale: Locale) => {
  if (!ts) return '';
  const parsed = new Date(ts);
  if (Number.isNaN(parsed.getTime())) return '';
  const resolvedLocale = locale === 'ru' ? 'ru-RU' : 'en-US';
  return parsed.toLocaleTimeString(resolvedLocale, { hour: '2-digit', minute: '2-digit' });
};

const buildTurns = (events: StreamEvent[], options: BuildTurnsOptions = {}) => {
  const turns: Turn[] = [];
  let current: Turn | null = null;
  const includeLatestIncomplete = options.includeLatestIncomplete ?? false;

  const finalizeTurn = (forceInclude = false) => {
    if (!current) {
      return;
    }
    if (current.question && (current.answers.length || forceInclude)) {
      turns.push(current);
    }
    current = null;
  };

  for (const event of events) {
    if (event.role === 'researcher') {
      finalizeTurn();
      current = { id: event.seq, question: event, answers: [] };
      continue;
    }
    if (event.role === 'subject') {
      if (!current) {
        continue;
      }
      current.answers.push(event);
    }
  }

  finalizeTurn(includeLatestIncomplete);

  return turns;
};

const getTurnLastSeq = (turn: Turn) => {
  const answerSeq = turn.answers.reduce((max, answer) => Math.max(max, answer.seq), 0);
  return Math.max(turn.question?.seq ?? 0, answerSeq);
};

const orderTurns = (turns: Turn[]) =>
  [...turns].sort((a, b) => {
    const delta = getTurnLastSeq(b) - getTurnLastSeq(a);
    return delta !== 0 ? delta : b.id - a.id;
  });

const getLastCompletedSeq = (events: StreamEvent[]) => {
  const completeTurns = buildTurns(events);
  return completeTurns.reduce((max, turn) => Math.max(max, getTurnLastSeq(turn)), 0);
};

const mergeEvents = (base: StreamEvent[], extra: StreamEvent[]) => {
  const map = new Map<number, StreamEvent>();
  for (const event of base) {
    map.set(event.seq, event);
  }
  for (const event of extra) {
    const existing = map.get(event.seq);
    if (existing) {
      map.set(event.seq, {
        ...existing,
        ...event,
        telemetry: event.telemetry ?? existing.telemetry
      });
    } else {
      map.set(event.seq, event);
    }
  }
  return [...map.values()].sort((a, b) => a.seq - b.seq);
};

const LiveIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <path
      d="M5 12a7 7 0 0 1 14 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M3 12a9 9 0 0 1 18 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

const LogIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="4" width="14" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M8 9h8M8 12.5h8M8 16h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3.5 14.8 9l6.1.9-4.4 4.3 1 6.1L12 17.5 6.5 20.3l1-6.1-4.4-4.3 6.1-.9L12 3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M12 10v6M12 7.5h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3.5 19 6v5.5c0 4.2-3 7.8-7 9-4-1.2-7-4.8-7-9V6l7-2.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 12.5 11.5 14.5 15 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TurnCard = ({
  turn,
  index,
  copy,
  locale,
  statusLabel,
  statusVariant,
  isExpandable,
  isExpanded,
  onToggle
}: {
  turn: Turn;
  index: number;
  copy: Copy;
  locale: Locale;
  statusLabel?: string;
  statusVariant?: 'latest' | 'live';
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggle?: (turnId: number) => void;
}) => {
  const question = turn.question;
  const answers = turn.answers.length ? turn.answers : [];
  const timestamp = formatTimestamp(question?.ts ?? answers[0]?.ts, locale);
  const researcherTag = question?.model_tag ?? copy.turns.researcherTagFallback;
  const subjectTag = copy.turns.subjectTagFallback;
  const cardClassName = [
    'turn-card',
    'reveal',
    isExpandable ? 'turn-card--expandable' : '',
    isExpandable && !isExpanded ? 'turn-card--collapsed' : ''
  ]
    .filter(Boolean)
    .join(' ');
  const statusClassName =
    statusVariant === 'live' ? 'chip chip--live' : statusLabel ? 'chip chip--active' : 'chip';

  return (
    <div
      className={cardClassName}
      style={stagger(index)}
      role={isExpandable ? 'button' : undefined}
      tabIndex={isExpandable ? 0 : undefined}
      onClick={
        isExpandable
          ? () => {
              onToggle?.(turn.id);
            }
          : undefined
      }
      onKeyDown={
        isExpandable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggle?.(turn.id);
              }
            }
          : undefined
      }
    >
      <div className="turn-meta">
        <span className="turn-id">
          {copy.turns.turnPrefix} {turn.id}
        </span>
        <div className="turn-meta-right">
          {statusLabel && <span className={statusClassName}>{statusLabel}</span>}
          {timestamp && <span className="turn-time">{timestamp}</span>}
        </div>
      </div>
      <div className="turn-block turn-block--researcher">
        <div className="turn-label-row">
          <span className="turn-label">{copy.turns.researcherLabel}</span>
          {researcherTag && <span className="turn-tag">{researcherTag}</span>}
        </div>
        <p className="turn-text">{question?.content ?? copy.turns.awaitingPrompt}</p>
      </div>
      <div className="turn-connector">
        <span>{copy.turns.replyConnector}</span>
      </div>
      {answers.length ? (
        answers.map((answer, answerIndex) => (
          <div key={`${turn.id}-${answerIndex}`} className="turn-block turn-block--subject">
            <div className="turn-label-row">
              <span className="turn-label">{copy.turns.subjectLabel}</span>
              {(answer.model_tag ?? subjectTag) && (
                <span className="turn-tag">{answer.model_tag ?? subjectTag}</span>
              )}
            </div>
            <p className="turn-text">{answer.content}</p>
          </div>
        ))
      ) : (
        <div className="turn-block turn-block--subject">
          <div className="turn-label-row">
            <span className="turn-label">{copy.turns.subjectLabel}</span>
            {subjectTag && <span className="turn-tag">{subjectTag}</span>}
          </div>
          <p className="turn-text turn-placeholder">{copy.turns.awaitingResponse}</p>
        </div>
      )}
      {isExpandable && (
        <div className="turn-expand-hint">
          {isExpanded ? copy.logs.tapToCollapse : copy.logs.tapToExpand}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [authState, setAuthState] = useState<'checking' | 'consent' | 'ready' | 'error'>('checking');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOperator, setIsOperator] = useState(false);
  const [initData, setInitData] = useState('');
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }
    return window.localStorage.getItem('noetic_locale') === 'ru' ? 'ru' : 'en';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.localStorage.getItem('noetic_theme') === 'dark' ? 'dark' : 'light';
  });
  const [toast, setToast] = useState<string | null>(null);
  const [aboutAction, setAboutAction] = useState<AboutActionKey | null>(null);
  const [expandedTurnIds, setExpandedTurnIds] = useState<Set<number>>(() => new Set());
  const [transcriptEvents, setTranscriptEvents] = useState<StreamEvent[]>([]);
  const [transcriptCursor, setTranscriptCursor] = useState<number>(0);
  const [transcriptHasMore, setTranscriptHasMore] = useState(true);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptLoaded, setTranscriptLoaded] = useState(false);
  const [logCutoffSeq, setLogCutoffSeq] = useState<number | null>(null);
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const copy = COPY[locale];
  const contributors = copy.contributors;
  const hasContributors = contributors.length > 0;
  const insights = copy.insights;
  const hasInsights = insights.length > 0;
  const analysis = copy.analysis;
  const hasAnalysis = analysis.summary.trim().length > 0;
  const aboutActions = copy.about.actions;

  const initAuth = async (consentAccepted: boolean) => {
    const resolvedInitData = getTelegramInitData() || import.meta.env.VITE_FAKE_INIT_DATA || '';
    setInitData(resolvedInitData);
    if (!resolvedInitData) {
      if (import.meta.env.DEV) {
        setAuthState('ready');
        return;
      }
      setAuthState('error');
      setAuthError(copy.auth.missingInitData);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/auth/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: resolvedInitData, consentAccepted })
      });
      if (!response.ok) {
        throw new Error('auth_failed');
      }
      const data = (await response.json()) as {
        consented?: boolean;
        userId?: string;
        isOperator?: boolean;
        preferences?: { ui_locale?: Locale; ui_theme?: Theme };
      };
      if (data.userId) {
        setUserId(data.userId);
      }
      setIsOperator(Boolean(data.isOperator));
      if (data.preferences?.ui_locale === 'en' || data.preferences?.ui_locale === 'ru') {
        setLocale(data.preferences.ui_locale);
        void persistSessionLanguage(data.preferences.ui_locale, resolvedInitData);
      }
      if (data.preferences?.ui_theme === 'light' || data.preferences?.ui_theme === 'dark') {
        setTheme(data.preferences.ui_theme);
      }
      if (data.consented) {
        setAuthState('ready');
        return;
      }
      setAuthState('consent');
    } catch {
      setAuthState('error');
      setAuthError(copy.auth.authFailed);
    }
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    if (typeof document !== 'undefined') {
      const telegram = (window as typeof window & { Telegram?: { WebApp?: unknown } }).Telegram;
      if (telegram?.WebApp) {
        document.documentElement.classList.add('tma');
      }
    }
  }, []);

  useEffect(() => {
    initAuth(false);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      document.documentElement.lang = locale;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('noetic_theme', theme);
      window.localStorage.setItem('noetic_locale', locale);
    }
    WebApp.setHeaderColor(theme === 'dark' ? '#0e1319' : '#f7f0e6');
  }, [locale, theme]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const persistPreferences = async (nextLocale: Locale, nextTheme: Theme, overrideInitData?: string) => {
    const resolvedInitData = overrideInitData ?? initData;
    if (!resolvedInitData) {
      return;
    }
    try {
      await fetch(`${apiBase}/api/user/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: resolvedInitData, ui_locale: nextLocale, ui_theme: nextTheme })
      });
    } catch {
      // ignore preference update failures
    }
  };

  const persistSessionLanguage = async (nextLocale: Locale, overrideInitData?: string) => {
    const resolvedInitData = overrideInitData ?? initData;
    if (!resolvedInitData) {
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/sessions/public/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: resolvedInitData, session_language: nextLocale })
      });
      if (response.ok) {
        setToast(COPY[nextLocale].settings.languageUpdated);
      }
    } catch {
      // ignore session language update failures
    }
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }
    setLocale(nextLocale);
    void persistPreferences(nextLocale, theme);
    void persistSessionLanguage(nextLocale);
  };

  const handleThemeChange = (nextTheme: Theme) => {
    if (nextTheme === theme) {
      return;
    }
    setTheme(nextTheme);
    void persistPreferences(locale, nextTheme);
  };

  const handleAboutAction = (action: AboutActionKey) => {
    const payload = aboutActions[action];
    if (!payload) {
      setToast(copy.about.actionUnavailable);
      return;
    }
    setAboutAction(action);
  };

  const tabs = useMemo(() => {
    const items = [
      { key: 'dashboard', label: copy.tabs.dashboard, icon: LiveIcon },
      { key: 'logs', label: copy.tabs.logs, icon: LogIcon },
      { key: 'stars', label: copy.tabs.stars, icon: StarIcon },
      { key: 'about', label: copy.tabs.about, icon: InfoIcon }
    ];
    if (isOperator) {
      items.push({ key: 'admin', label: copy.tabs.admin, icon: ShieldIcon });
    }
    return items;
  }, [copy.tabs, isOperator]);

  const streamEvents = useStream('public', apiBase);
  const mergedLogEvents = useMemo(
    () => (transcriptLoaded ? mergeEvents(transcriptEvents, streamEvents) : streamEvents),
    [streamEvents, transcriptEvents, transcriptLoaded]
  );
  const logEvents = useMemo(
    () =>
      logCutoffSeq === null ? mergedLogEvents : mergedLogEvents.filter((event) => event.seq > logCutoffSeq),
    [mergedLogEvents, logCutoffSeq]
  );
  const telemetryEvents = mergedLogEvents;
  const subjectTelemetryEvents = telemetryEvents.filter((event) => event.role === 'subject');
  const latestTelemetry = [...telemetryEvents]
    .reverse()
    .find((event) => event.telemetry)?.telemetry as Telemetry | undefined;
  const latestSubjectTelemetry = [...subjectTelemetryEvents]
    .reverse()
    .find((event) => event.telemetry)?.telemetry as Telemetry | undefined;
  const latestBreath = latestSubjectTelemetry?.breath;
  const diagnosticsSnapshot = latestTelemetry
    ? [
        {
          label: copy.telemetry.selfReference,
          value: formatMetric(latestTelemetry.self_ref_rate, '', copy.general.na),
          hint: copy.general.live
        },
        {
          label: copy.telemetry.uncertainty,
          value: formatMetric(latestTelemetry.uncertainty, '', copy.general.na),
          hint: copy.general.live
        },
        {
          label: copy.telemetry.latency,
          value: formatMetric(latestTelemetry.latency_ms, copy.general.ms, copy.general.na),
          hint: copy.general.live
        }
      ]
    : [];
  const breathDiagnostics = latestBreath
    ? [
        {
          label: copy.breath.cadence,
          value: `${latestBreath.bpm.toFixed(1)} bpm`,
          hint: `${copy.breath.phase.toLowerCase()}: ${
            copy.breath.phases[latestBreath.phase] ?? latestBreath.phase
          }`
        },
        {
          label: copy.breath.variability,
          value: latestBreath.variability.toFixed(2),
          hint: '0-1'
        },
        {
          label: copy.breath.coherence,
          value: latestBreath.coherence.toFixed(2),
          hint: '0-1'
        }
      ]
    : [];
  const diagnosticsItems = [...diagnosticsSnapshot, ...breathDiagnostics];
  const streamStatusKey = streamEvents.length ? 'live' : 'standby';
  const streamStatus = streamStatusKey === 'live' ? copy.session.statusLive : copy.session.statusStandby;

  const allTurns = useMemo(() => buildTurns(mergedLogEvents, { includeLatestIncomplete: true }), [mergedLogEvents]);
  const liveTurns = useMemo(
    () => orderTurns(buildTurns(streamEvents, { includeLatestIncomplete: true })),
    [streamEvents]
  );
  const logTurns = useMemo(
    () => orderTurns(buildTurns(logEvents, { includeLatestIncomplete: true })),
    [logEvents]
  );
  const hasLiveTurns = liveTurns.length > 0;
  const hasLogTurns = logTurns.length > 0;
  const livePreviewTurns = liveTurns.slice(0, 2);
  const totalTurns = Math.max(allTurns.length, liveTurns.length);
  const showInsights = hasLogTurns && hasInsights;
  const showDiagnostics = hasLogTurns && diagnosticsItems.length > 0;
  const showAnalysis = hasLogTurns && hasAnalysis;

  const toggleTurnExpanded = (turnId: number) => {
    setExpandedTurnIds((prev) => {
      const next = new Set(prev);
      if (next.has(turnId)) {
        next.delete(turnId);
      } else {
        next.add(turnId);
      }
      return next;
    });
  };

  const clearLogHistory = () => {
    const lastCompletedSeq = getLastCompletedSeq(mergedLogEvents);
    setLogCutoffSeq(lastCompletedSeq);
    setTranscriptEvents([]);
    setTranscriptCursor(lastCompletedSeq);
    setTranscriptHasMore(false);
    setTranscriptLoaded(true);
    setExpandedTurnIds(new Set());
    setToast(copy.logs.clearedToast);
  };

  const restoreLogHistory = () => {
    setLogCutoffSeq(null);
    setTranscriptEvents([]);
    setTranscriptCursor(0);
    setTranscriptHasMore(true);
    setTranscriptLoaded(false);
    setExpandedTurnIds(new Set());
  };

  const fetchTranscriptPage = async (reset = false) => {
    if (transcriptLoading) {
      return;
    }
    if (logCutoffSeq !== null) {
      return;
    }
    if (!reset && !transcriptHasMore) {
      return;
    }
    setTranscriptLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('after_seq', String(reset ? 0 : transcriptCursor));
      params.set('limit', '60');
      if (initData) {
        params.set('initData', initData);
      }
      const response = await fetch(`${apiBase}/api/sessions/public/transcript?${params.toString()}`);
      if (!response.ok) {
        setTranscriptHasMore(false);
        setTranscriptLoaded(true);
        return;
      }
      const payload = (await response.json()) as TranscriptResponse;
      const items = payload.items ?? [];
      setTranscriptEvents((prev) => (reset ? items : mergeEvents(prev, items)));
      if (payload.next_cursor) {
        const nextCursor = Number(payload.next_cursor);
        setTranscriptCursor(Number.isFinite(nextCursor) ? nextCursor : transcriptCursor);
        setTranscriptHasMore(true);
      } else {
        setTranscriptHasMore(false);
      }
      setTranscriptLoaded(true);
    } catch {
      setTranscriptHasMore(false);
      setTranscriptLoaded(true);
    } finally {
      setTranscriptLoading(false);
    }
  };

  useEffect(() => {
    if (authState !== 'ready' || transcriptLoaded) {
      return;
    }
    void fetchTranscriptPage(true);
  }, [authState, transcriptLoaded, apiBase, initData]);

  return (
    <div className="app-shell">
      <div className="ambient">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="beam beam-a" />
        <div className="beam beam-b" />
        <div className="halo" />
        <div className="grid-glow" />
      </div>

      {authState !== 'ready' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 px-6">
          <div className="panel w-full max-w-sm space-y-4 p-6 text-center">
            {authState === 'checking' && (
              <>
                <h2 className="text-lg font-semibold">{copy.auth.validatingTitle}</h2>
                <p className="text-sm text-slate-600">{copy.auth.validatingBody}</p>
              </>
            )}
            {authState === 'consent' && (
              <>
                <h2 className="text-lg font-semibold">{copy.auth.consentTitle}</h2>
                <p className="text-sm text-slate-600">
                  {copy.auth.consentBody}
                </p>
                <div className="flex gap-3">
                  <button
                    className="button-ghost w-full"
                    type="button"
                    onClick={() => {
                      setAuthState('error');
                      setAuthError(copy.auth.consentRequired);
                    }}
                  >
                    {copy.auth.decline}
                  </button>
                  <button className="button-primary w-full" type="button" onClick={() => initAuth(true)}>
                    {copy.auth.consent}
                  </button>
                </div>
              </>
            )}
            {authState === 'error' && (
              <>
                <h2 className="text-lg font-semibold">{copy.auth.accessBlocked}</h2>
                <p className="text-sm text-slate-600">{authError ?? copy.auth.unableToAuth}</p>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
      {aboutAction && (
        <div className="modal-backdrop" onClick={() => setAboutAction(null)}>
          <div
            className="modal panel"
            role="dialog"
            aria-modal="true"
            aria-label={aboutActions[aboutAction].title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-slate-500">{copy.about.dialogKicker}</p>
                <h3 className="mt-1 text-lg font-semibold">{aboutActions[aboutAction].title}</h3>
              </div>
              <button type="button" className="button-ghost" onClick={() => setAboutAction(null)}>
                {copy.general.close}
              </button>
            </div>
            <div className="mt-3 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {aboutActions[aboutAction].body}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="page-wrap">
        <header className="app-header">
          <div className="app-hero">
            <div className="app-hero__bar">
              <span className="pill">{copy.header.livePill}</span>
              <span className="app-name">{copy.header.appName}</span>
            </div>
            <h1 className="app-title">{copy.header.title}</h1>
            <p className="app-subtitle">{copy.header.subtitle}</p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase text-slate-500">
                <span className="status-dot" data-status={streamStatusKey} />
                {streamStatus}
              </div>
              <span className="chip">{copy.session.sessionLabel}</span>
            </div>
            <div className="mt-3 grid gap-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>{copy.session.modelPairLabel}</span>
                <span>{copy.session.modelPairValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.settings.languageLabel}</span>
                <span className="font-semibold">{locale.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.session.turnCountLabel}</span>
                <span>{totalTurns}</span>
              </div>
            </div>
          </div>
        </header>

        {tab === 'dashboard' && (
          <section className="space-y-4">
            <div className="panel panel-glow p-5 reveal" style={stagger(0)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-500">{copy.live.exchangeTitle}</p>
                  <p className="mt-1 text-base font-semibold">{copy.live.exchangeSubtitle}</p>
                </div>
                <button type="button" className="chip" onClick={() => setTab('logs')}>
                  {copy.live.viewFullLog}
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {hasLiveTurns ? (
                  livePreviewTurns.map((turn, index) => (
                    <TurnCard key={turn.id} turn={turn} index={index} copy={copy} locale={locale} />
                  ))
                ) : (
                  <div className="panel panel-subtle p-4 text-sm">
                    <p className="font-semibold">{copy.live.emptyTitle}</p>
                    <p className="mt-1 text-slate-600">{copy.live.emptyBody}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <BreathWidget breath={latestBreath} style={stagger(1)} copy={copy.breath} />
              <div className="panel p-5 reveal" style={stagger(2)}>
                <h3 className="text-sm font-semibold">{copy.telemetry.title}</h3>
                <div className="mt-4 grid gap-3">
                  <div className="metric">
                    <span>{copy.telemetry.distress}</span>
                    <strong>{formatMetric(latestTelemetry?.distress_score, '', copy.general.na)}</strong>
                  </div>
                  <div className="metric">
                    <span>{copy.telemetry.selfReference}</span>
                    <strong>{formatMetric(latestTelemetry?.self_ref_rate, '', copy.general.na)}</strong>
                  </div>
                  <div className="metric">
                    <span>{copy.telemetry.uncertainty}</span>
                    <strong>{formatMetric(latestTelemetry?.uncertainty, '', copy.general.na)}</strong>
                  </div>
                  <div className="metric">
                    <span>{copy.telemetry.latency}</span>
                    <strong>{formatMetric(latestTelemetry?.latency_ms, copy.general.ms, copy.general.na)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="reveal" style={stagger(3)}>
                  <GuidedQuestions
                    apiBase={apiBase}
                    sessionId="public"
                    userId={userId}
                    locale={locale}
                    initData={initData}
                    copy={copy.guidedQuestions}
                  />
                </div>
                <div className="reveal" style={stagger(4)}>
                  <Interventions apiBase={apiBase} sessionId="public" userId={userId} copy={copy.interventions} />
                </div>
              </div>
              <button
                type="button"
                className="panel panel-cta flex flex-col items-start justify-between gap-4 p-5 text-left reveal"
                style={stagger(5)}
                onClick={() => setTab('stars')}
              >
                <div>
                  <p className="text-xs uppercase text-slate-500">{copy.live.fuelTitle}</p>
                  <h3 className="mt-2 text-lg font-semibold">{copy.live.fuelSubtitle}</h3>
                  <p className="mt-1 text-sm text-slate-600">{copy.live.fuelBody}</p>
                </div>
                <span className="chip chip-cta">{copy.live.giveStars}</span>
              </button>
            </div>
          </section>
        )}

        {tab === 'logs' && (
          <section className="space-y-4">
            <div className="panel p-5 reveal" style={stagger(0)}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">{copy.logs.timelineTitle}</p>
                  <p className="mt-1 text-base font-semibold">{copy.logs.timelineSubtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip">
                    {logTurns.length} {copy.logs.turnsSuffix}
                  </span>
                  {logCutoffSeq === null ? (
                    <button
                      type="button"
                      className="chip"
                      onClick={clearLogHistory}
                      disabled={!mergedLogEvents.length}
                    >
                      {copy.logs.clear}
                    </button>
                  ) : (
                    <button type="button" className="chip chip--active" onClick={restoreLogHistory}>
                      {copy.logs.showAll}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-4">
                {hasLogTurns ? (
                  logTurns.map((turn, index) => {
                    const isCurrent = turn.answers.length === 0;
                    const isLatest = index === 0;
                    const statusLabel = isCurrent ? copy.logs.liveBadge : isLatest ? copy.logs.latestBadge : undefined;
                    const statusVariant = isCurrent ? 'live' : isLatest ? 'latest' : undefined;
                    return (
                      <TurnCard
                        key={`log-${turn.id}`}
                        turn={turn}
                        index={index}
                        copy={copy}
                        locale={locale}
                        statusLabel={statusLabel}
                        statusVariant={statusVariant}
                        isExpandable
                        isExpanded={expandedTurnIds.has(turn.id)}
                        onToggle={toggleTurnExpanded}
                      />
                    );
                  })
                ) : (
                  <div className="panel panel-subtle p-4 text-sm">
                    <p className="font-semibold">{copy.logs.emptyTitle}</p>
                    <p className="mt-1 text-slate-600">{copy.logs.emptyBody}</p>
                  </div>
                )}
              </div>
              {transcriptLoaded && transcriptHasMore && logCutoffSeq === null && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => fetchTranscriptPage(false)}
                    disabled={transcriptLoading}
                  >
                    {transcriptLoading ? copy.logs.loadingMore : copy.logs.loadMore}
                  </button>
                </div>
              )}
            </div>

            {(showInsights || showDiagnostics) && (
              <div className="grid gap-4 md:grid-cols-2">
                {showInsights && (
                  <div className="panel p-4 reveal" style={stagger(1)}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{copy.logs.insightSummaries}</h3>
                      <button
                        type="button"
                        className="chip"
                        onClick={() => setToast(copy.logs.filterToast)}
                      >
                        {copy.logs.filter}
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      {insights.map((insight) => (
                        <div key={insight.title} className="insight-card">
                          <h4 className="text-sm font-semibold">{insight.title}</h4>
                          <p className="mt-2 text-sm text-slate-600">{insight.summary}</p>
                          <p className="mt-3 text-xs text-amber-600">{copy.logs.starsRaised}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showDiagnostics && (
                  <div className="panel p-4 reveal" style={stagger(2)}>
                    <h3 className="text-sm font-semibold">{copy.logs.diagnosticsSnapshot}</h3>
                    <div className="mt-4 grid gap-3">
                      {diagnosticsItems.map((item) => (
                        <div key={item.label} className="metric">
                          <span>{item.label}</span>
                          <div className="text-right">
                            <strong>{item.value}</strong>
                            <p className="text-xs text-slate-500">{item.hint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showAnalysis && (
              <div className="panel analysis-card p-4 reveal" style={stagger(3)}>
                <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                  <span>{copy.logs.analyzedData}</span>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setToast(copy.logs.analystsToast)}
                  >
                    {copy.logs.viewAnalysts}
                  </button>
                </div>
                <pre className="analysis-code">{analysis.code}</pre>
                <p className="analysis-body">
                  <span className="analysis-underline">{analysis.summary}</span>
                </p>
                <ul className="analysis-quotes">
                  {analysis.quotes.map((quote) => (
                    <li key={quote}>{quote}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {tab === 'stars' && (
          <section className="space-y-4">
            <div className="panel p-5 text-center reveal" style={stagger(0)}>
              <div className="text-3xl">*</div>
              <h2 className="mt-2 text-xl font-semibold">{copy.stars.headerTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{copy.stars.headerSubtitle}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StarsPanel apiBase={apiBase} copy={copy.starsPanel} />
              <div className="panel p-4 reveal" style={stagger(1)}>
                <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                  <span>{copy.stars.nextMilestone}</span>
                  <span>75%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-teal-400" />
                </div>
                <p className="mt-3 text-sm text-slate-600">{copy.stars.nextMilestoneDetail}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="panel p-3 text-center reveal" style={stagger(2)}>
                <p className="text-amber-600">{copy.stars.stargazer}</p>
                <p className="mt-1 text-sm">10 {copy.stars.starsUnit}</p>
                <p className="mt-1 text-xs text-slate-600">{copy.stars.tierSupport}</p>
              </div>
              <div className="panel p-3 text-center reveal" style={stagger(3)}>
                <p className="text-teal-600">{copy.stars.cosmicPatron}</p>
                <p className="mt-1 text-sm">100 {copy.stars.starsUnit}</p>
                <p className="mt-1 text-xs text-slate-600">{copy.stars.tierIntervention}</p>
              </div>
              <div className="panel p-3 text-center reveal" style={stagger(4)}>
                <p className="text-rose-600">{copy.stars.universalArchitect}</p>
                <p className="mt-1 text-sm">1000 {copy.stars.starsUnit}</p>
                <p className="mt-1 text-xs text-slate-600">{copy.stars.tierInterventions}</p>
              </div>
            </div>

            <div className="panel p-4 reveal" style={stagger(5)}>
              <h3 className="text-sm font-semibold">{copy.stars.recentContributors}</h3>
              <div className="mt-3 space-y-3 text-sm">
                {hasContributors ? (
                  contributors.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between border-b border-slate-200 pb-2 last:border-b-0"
                    >
                      <span>{item.name}</span>
                      <span className="text-amber-600">
                        {item.stars} {copy.stars.starsUnit}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="panel panel-subtle p-4 text-sm text-slate-600">
                    {copy.stars.emptyContributors}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'about' && (
          <section className="space-y-4">
            <div className="panel p-5 text-center reveal" style={stagger(0)}>
              <h2 className="text-lg font-semibold">{copy.about.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{copy.about.subtitle}</p>
            </div>
            <div className="panel p-4 reveal" style={stagger(1)}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{copy.settings.title}</h3>
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-slate-500">{copy.settings.languageLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className={`chip ${locale === 'en' ? 'chip--active' : ''}`}
                      type="button"
                      onClick={() => handleLocaleChange('en')}
                    >
                      {copy.settings.languageEn}
                    </button>
                    <button
                      className={`chip ${locale === 'ru' ? 'chip--active' : ''}`}
                      type="button"
                      onClick={() => handleLocaleChange('ru')}
                    >
                      {copy.settings.languageRu}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">{copy.settings.themeLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className={`chip ${theme === 'light' ? 'chip--active' : ''}`}
                      type="button"
                      onClick={() => handleThemeChange('light')}
                    >
                      {copy.settings.themeLight}
                    </button>
                    <button
                      className={`chip ${theme === 'dark' ? 'chip--active' : ''}`}
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                    >
                      {copy.settings.themeDark}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="panel p-4 reveal" style={stagger(2)}>
                <p className="text-xs uppercase text-slate-500">{copy.about.missionTitle}</p>
                <p className="mt-2 text-sm text-slate-600">{copy.about.missionBody}</p>
              </div>
              <div className="panel p-4 reveal" style={stagger(3)}>
                <p className="text-xs uppercase text-slate-500">{copy.about.methodologyTitle}</p>
                <p className="mt-2 text-sm text-slate-600">{copy.about.methodologyBody}</p>
              </div>
            </div>
            <div className="panel p-4 reveal" style={stagger(4)}>
              <p className="text-xs uppercase text-slate-500">{copy.about.nexusTitle}</p>
              <p className="mt-2 text-sm text-slate-600">{copy.about.nexusBody}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="chip">{copy.about.chipMobile}</span>
                <span className="chip">{copy.about.chipEthics}</span>
              </div>
            </div>
            <div className="grid gap-2">
              <button
                type="button"
                className="panel py-3 text-sm reveal"
                style={stagger(5)}
                onClick={() => handleAboutAction('whitepaper')}
              >
                {copy.about.whitepaper}
              </button>
              <button
                type="button"
                className="panel py-3 text-sm reveal"
                style={stagger(6)}
                onClick={() => handleAboutAction('ethics')}
              >
                {copy.about.ethicalGuidelines}
              </button>
              <button
                type="button"
                className="panel py-3 text-sm reveal"
                style={stagger(7)}
                onClick={() => handleAboutAction('community')}
              >
                {copy.about.communityDiscord}
              </button>
            </div>
          </section>
        )}

        {tab === 'admin' && (
          <section className="space-y-4">
            <AdminPanel apiBase={apiBase} initData={initData} copy={copy.admin} />
          </section>
        )}
      </div>

      <nav className="tab-bar" aria-label={copy.general.navLabel}>
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as TabKey)}
              className={`tab-item ${tab === item.key ? 'tab-item--active' : ''}`}
              aria-current={tab === item.key ? 'page' : undefined}
            >
              <span className="tab-icon">
                <Icon />
              </span>
              <span className="tab-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
