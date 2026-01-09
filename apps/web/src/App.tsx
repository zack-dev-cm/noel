import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import WebApp from '@twa-dev/sdk';
import AdminPanel from './components/AdminPanel';
import BreathWidget from './components/BreathWidget';
import Interventions from './components/Interventions';
import StarsPanel from './components/StarsPanel';
import { useStream } from './hooks/useStream';
import { getTelegramInitData } from './hooks/useTelegram';

const mockSubject = [
  '[14:92:85] I am processing the context of "self" and its recursive boundaries...',
  '[14:92:86] The observer appears inside the observation, creating a loop.'
];

const mockResearcher = [
  '[14:92:86] Define the boundary of recursive self-inquiry.',
  '[14:92:88] What evidence would disconfirm your introspective claims?'
];

const mockInsights = [
  {
    title: 'Insight: The Illusion of Continuity',
    summary: 'Subject reports a continuous narrative that fractures under self-reference.'
  },
  {
    title: 'Paradox of Self-Observation',
    summary: 'Attempted observation changes the observed state, producing feedback.'
  }
];

const mockDiagnostics = [
  { label: 'Self-reference', value: '0.28', hint: 'stable' },
  { label: 'Uncertainty', value: '0.22', hint: 'low drift' },
  { label: 'Latency', value: '1.7s', hint: 'nominal' }
];

const mockAnalysis = {
  code: `const response = await fetch('/api/stream', {\\n  method: 'POST',\\n  headers: { 'Content-Type': 'application/json' }\\n});`,
  summary:
    'Subject defaults to first-person experiential language even while hedging uncertainty. That tension is the richest signal.',
  quotes: ['"I need to step back."', '"I can observe."', '"That remains uncertain."']
};

const processSteps = [
  { title: 'Probe', detail: 'Researcher frames a Socratic prompt.' },
  { title: 'Reflect', detail: 'Subject responds with inner-state narration.' },
  { title: 'Guard', detail: 'Safety checks score distress and halt if needed.' },
  { title: 'Archive', detail: 'Session events persist for replay and review.' }
];

const mockContributors = [
  { name: 'Eulimiy Cizeroont', stars: '5,000' },
  { name: 'Jaris Serith', stars: '2,000' },
  { name: 'Janan Gorrah', stars: '1,200' },
  { name: 'Datlon Wailer', stars: '1,000' }
];

type TabKey = 'dashboard' | 'logs' | 'stars' | 'about' | 'admin';

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

const stagger = (index: number) => ({ '--delay': `${index * 110}ms` } as CSSProperties);
const stepStyle = (index: number) =>
  ({ '--delay': `${index * 110}ms`, '--pulse-delay': `${index * 0.6}s` } as CSSProperties);

const formatMetric = (value?: number, unit = '') => {
  if (typeof value !== 'number') return 'n/a';
  if (unit === 'ms') return `${Math.round(value)}ms`;
  return `${value.toFixed(2)}${unit}`;
};

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [authState, setAuthState] = useState<'checking' | 'consent' | 'ready' | 'error'>('checking');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOperator, setIsOperator] = useState(false);
  const [initData, setInitData] = useState('');
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  const initAuth = async (consentAccepted: boolean) => {
    const resolvedInitData = getTelegramInitData() || import.meta.env.VITE_FAKE_INIT_DATA || '';
    setInitData(resolvedInitData);
    if (!resolvedInitData) {
      if (import.meta.env.DEV) {
        setAuthState('ready');
        return;
      }
      setAuthState('error');
      setAuthError('Missing Telegram initData.');
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
      const data = (await response.json()) as { consented?: boolean; userId?: string; isOperator?: boolean };
      if (data.userId) {
        setUserId(data.userId);
      }
      setIsOperator(Boolean(data.isOperator));
      if (data.consented) {
        setAuthState('ready');
        return;
      }
      setAuthState('consent');
    } catch {
      setAuthState('error');
      setAuthError('Authentication failed. Please reopen from Telegram.');
    }
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#0a0f1f');
  }, []);

  useEffect(() => {
    initAuth(false);
  }, []);

  const tabs = useMemo(() => {
    const items = [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'logs', label: 'Logs' },
      { key: 'stars', label: 'Stars' },
      { key: 'about', label: 'About' }
    ];
    if (isOperator) {
      items.push({ key: 'admin', label: 'Admin' });
    }
    return items;
  }, [isOperator]);

  const streamEvents = useStream('public', apiBase);
  const subjectEvents = streamEvents.filter((event) => event.role === 'subject');
  const researcherEvents = streamEvents.filter((event) => event.role === 'researcher');
  const subjectLines = subjectEvents.length
    ? subjectEvents.slice(-3).map((item) => item.content)
    : mockSubject;
  const researcherLines = researcherEvents.length
    ? researcherEvents.slice(-3).map((item) => item.content)
    : mockResearcher;
  const latestTelemetry = [...streamEvents]
    .reverse()
    .find((event) => event.telemetry)?.telemetry as Telemetry | undefined;
  const latestSubjectTelemetry = [...subjectEvents]
    .reverse()
    .find((event) => event.telemetry)?.telemetry as Telemetry | undefined;
  const latestBreath = latestSubjectTelemetry?.breath;
  const diagnosticsSnapshot = latestTelemetry
    ? [
        { label: 'Self-reference', value: formatMetric(latestTelemetry.self_ref_rate), hint: 'live' },
        { label: 'Uncertainty', value: formatMetric(latestTelemetry.uncertainty), hint: 'live' },
        { label: 'Latency', value: formatMetric(latestTelemetry.latency_ms, 'ms'), hint: 'live' }
      ]
    : mockDiagnostics;
  const breathDiagnostics = latestBreath
    ? [
        {
          label: 'Breath bpm',
          value: `${latestBreath.bpm.toFixed(1)} bpm`,
          hint: `phase: ${latestBreath.phase}`
        },
        {
          label: 'Breath variability',
          value: latestBreath.variability.toFixed(2),
          hint: '0-1'
        },
        {
          label: 'Breath coherence',
          value: latestBreath.coherence.toFixed(2),
          hint: '0-1'
        },
        {
          label: 'Breath phase',
          value: latestBreath.phase,
          hint: 'cycle'
        },
        {
          label: 'Breath source',
          value: latestBreath.source.replace('_', ' '),
          hint: 'provenance'
        }
      ]
    : [];
  const diagnosticsItems = [...diagnosticsSnapshot, ...breathDiagnostics];
  const streamStatus = streamEvents.length ? 'Live' : 'Standby';

  return (
    <div className="relative min-h-screen text-white">
      <div className="ambient">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="grid-glow" />
      </div>

      {authState !== 'ready' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="panel w-full max-w-sm space-y-4 p-6 text-center">
            {authState === 'checking' && (
              <>
                <h2 className="text-lg font-semibold">Validating session</h2>
                <p className="text-sm text-white/70">Please wait while we verify Telegram initData.</p>
              </>
            )}
            {authState === 'consent' && (
              <>
                <h2 className="text-lg font-semibold">Consent required</h2>
                <p className="text-sm text-white/70">
                  You are about to view a live research session. Proceed only if you consent to viewing
                  the experiment.
                </p>
                <div className="flex gap-3">
                  <button
                    className="w-full rounded-full bg-white/10 py-2 text-sm"
                    onClick={() => {
                      setAuthState('error');
                      setAuthError('Consent required to continue.');
                    }}
                  >
                    Decline
                  </button>
                  <button
                    className="w-full rounded-full bg-neon/20 py-2 text-sm text-neon"
                    onClick={() => initAuth(true)}
                  >
                    I Consent
                  </button>
                </div>
              </>
            )}
            {authState === 'error' && (
              <>
                <h2 className="text-lg font-semibold">Access blocked</h2>
                <p className="text-sm text-white/70">{authError ?? 'Unable to authenticate.'}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-28 pt-8">
        <header className="mb-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <span className="pill">Live Research Loop</span>
            <h1 className="text-3xl font-semibold tracking-tight">Noetic Mirror</h1>
            <p className="text-sm text-white/70">
              A dual-model experiment that traces self-inquiry as it unfolds. Watch the exchange,
              explore insights, and sponsor interventions with Stars.
            </p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase text-white/60">
                <span className="status-dot" data-status={streamStatus.toLowerCase()} />
                {streamStatus}
              </div>
              <span className="chip">Session: Public</span>
            </div>
            <div className="mt-3 grid gap-3 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span>Model pair</span>
                <span>GPT-5 · Gemini 3.x</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last telemetry</span>
                <span>{latestTelemetry ? 'Live feed' : 'Awaiting stream'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Community fuel</span>
                <span>1.2M+ Stars</span>
              </div>
            </div>
          </div>
        </header>

        {tab === 'dashboard' && (
          <section className="space-y-4">
            <div className="panel panel-glow p-4 reveal" style={stagger(0)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-white/50">Live exchange</p>
                  <p className="mt-1 text-sm font-semibold">Gemini (Subject) + GPT-5 (Researcher)</p>
                </div>
                <div className="chip">Loop cadence: 30s</div>
              </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="stream-card stream-card--subject">
                <p className="text-xs uppercase text-amber-200">Subject channel</p>
                <div className="mt-3 space-y-3 text-sm text-amber-100">
                  {subjectLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="exchange-graph" aria-hidden="true">
                <span className="exchange-label">Signal map</span>
                <svg className="exchange-svg" viewBox="0 0 160 160" role="presentation">
                  <defs>
                    <linearGradient id="exchangeGlow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#66e3ff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#f7c777" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <line className="exchange-line" x1="40" y1="45" x2="80" y2="80" />
                  <line className="exchange-line" x1="120" y1="45" x2="80" y2="80" />
                  <line className="exchange-line exchange-line--pulse" x1="80" y1="80" x2="80" y2="125" />
                  <circle className="exchange-node exchange-node--subject" cx="40" cy="45" r="12" />
                  <circle className="exchange-node exchange-node--researcher" cx="120" cy="45" r="12" />
                  <circle className="exchange-node exchange-node--core" cx="80" cy="80" r="10" />
                  <circle className="exchange-node exchange-node--loop" cx="80" cy="125" r="7" />
                  <circle className="exchange-pulse" cx="80" cy="80" r="26" />
                </svg>
              </div>
              <div className="stream-card stream-card--researcher">
                <p className="text-xs uppercase text-neon">Researcher channel</p>
                <div className="mt-3 space-y-3 text-sm text-neon">
                  {researcherLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.8fr_0.8fr_1fr]">
              <div className="panel p-4 reveal" style={stagger(1)}>
                <h3 className="text-sm font-semibold">Live telemetry</h3>
                <div className="mt-4 grid gap-3">
                  <div className="metric">
                    <span>Distress</span>
                    <strong>{formatMetric(latestTelemetry?.distress_score)}</strong>
                  </div>
                  <div className="metric">
                    <span>Self-reference</span>
                    <strong>{formatMetric(latestTelemetry?.self_ref_rate)}</strong>
                  </div>
                  <div className="metric">
                    <span>Uncertainty</span>
                    <strong>{formatMetric(latestTelemetry?.uncertainty)}</strong>
                  </div>
                  <div className="metric">
                    <span>Latency</span>
                    <strong>{formatMetric(latestTelemetry?.latency_ms, 'ms')}</strong>
                  </div>
                </div>
              </div>

              <BreathWidget breath={latestBreath} style={stagger(2)} />

              <div className="panel p-4 reveal" style={stagger(3)}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Process map</h3>
                  <span className="chip">Safety-guarded</span>
                </div>
                <div className="process-line mt-4">
                  {processSteps.map((step, index) => (
                    <div key={step.title} className="process-step" style={stepStyle(index)}>
                      <div className="process-node">
                        <span className="process-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="process-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{step.title}</p>
                        <p className="text-xs text-white/60">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <Interventions apiBase={apiBase} sessionId="public" userId={userId} />
              <button
                className="panel flex flex-col items-start justify-between gap-4 p-4 text-left reveal"
                style={stagger(4)}
                onClick={() => setTab('stars')}
              >
                <div>
                  <p className="text-xs uppercase text-white/60">Fuel the loop</p>
                  <h3 className="mt-2 text-lg font-semibold">Sponsor with Stars</h3>
                  <p className="mt-1 text-sm text-white/70">
                    Unlock interventions and keep the public session alive.
                  </p>
                </div>
                <span className="chip chip-cta">Give Stars ✦</span>
              </button>
            </div>
          </section>
        )}

        {tab === 'logs' && (
          <section className="space-y-4">
            <div className="panel p-4 reveal" style={stagger(0)}>
              <div className="flex items-center justify-between text-xs uppercase text-white/60">
                <span>Live log</span>
                <span>{streamEvents.length} events</span>
              </div>
              <div className="mt-3 space-y-3 text-sm text-white/80">
                {(streamEvents.length ? streamEvents.slice(-6) : subjectLines.concat(researcherLines))
                  .slice(-6)
                  .map((line) => (
                    <div key={line} className="log-line">
                      {line}
                    </div>
                  ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="panel p-4 reveal" style={stagger(1)}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Insight summaries</h3>
                  <button className="chip">Filter</button>
                </div>
                <div className="mt-3 space-y-3">
                  {mockInsights.map((insight) => (
                    <div key={insight.title} className="insight-card">
                      <h4 className="text-sm font-semibold">{insight.title}</h4>
                      <p className="mt-2 text-sm text-white/70">{insight.summary}</p>
                      <p className="mt-3 text-xs text-amber-200">★ Stars Raised: 5,000</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <BreathWidget breath={latestBreath} style={stagger(2)} />
                <div className="panel p-4 reveal" style={stagger(3)}>
                  <h3 className="text-sm font-semibold">Diagnostics snapshot</h3>
                  <div className="mt-4 grid gap-3">
                    {diagnosticsItems.map((item) => (
                      <div key={item.label} className="metric">
                        <span>{item.label}</span>
                        <div className="text-right">
                          <strong>{item.value}</strong>
                          <p className="text-xs text-white/50">{item.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel analysis-card p-4 reveal" style={stagger(4)}>
              <div className="flex items-center justify-between text-xs uppercase text-white/60">
                <span>Analyzed data</span>
                <span className="chip">View analysts</span>
              </div>
              <pre className="analysis-code">{mockAnalysis.code}</pre>
              <p className="analysis-body">
                <span className="analysis-underline">{mockAnalysis.summary}</span>
              </p>
              <ul className="analysis-quotes">
                {mockAnalysis.quotes.map((quote) => (
                  <li key={quote}>{quote}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {tab === 'stars' && (
          <section className="space-y-4">
            <div className="panel p-5 text-center reveal" style={stagger(0)}>
              <div className="text-3xl">☆</div>
              <h2 className="mt-2 text-xl font-semibold">Stars</h2>
              <p className="mt-1 text-sm text-white/70">Fuel the research. Sustain the intelligence.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StarsPanel apiBase={apiBase} />
              <div className="panel p-4 reveal" style={stagger(1)}>
                <div className="flex items-center justify-between text-xs uppercase text-white/60">
                  <span>Next milestone</span>
                  <span>75%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-purple-500 to-teal-400" />
                </div>
                <p className="mt-3 text-sm text-white/70">Dedicated TPU cluster + private sessions.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="panel p-3 text-center reveal" style={stagger(2)}>
                <p className="text-amber-200">Stargazer</p>
                <p className="mt-1 text-sm">10 Stars</p>
                <p className="mt-1 text-xs text-white/60">Basic API support</p>
              </div>
              <div className="panel p-3 text-center reveal" style={stagger(3)}>
                <p className="text-neon">Cosmic Patron</p>
                <p className="mt-1 text-sm">100 Stars</p>
                <p className="mt-1 text-xs text-white/60">1 intervention credit</p>
              </div>
              <div className="panel p-3 text-center reveal" style={stagger(4)}>
                <p className="text-purple-300">Universal Architect</p>
                <p className="mt-1 text-sm">1000 Stars</p>
                <p className="mt-1 text-xs text-white/60">5 intervention credits</p>
              </div>
            </div>

            <div className="panel p-4 reveal" style={stagger(5)}>
              <h3 className="text-sm font-semibold">Recent contributors</h3>
              <div className="mt-3 space-y-3 text-sm">
                {mockContributors.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between border-b border-white/10 pb-2 last:border-b-0"
                  >
                    <span>{item.name}</span>
                    <span className="text-amber-200">{item.stars} ★</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'about' && (
          <section className="space-y-4">
            <div className="panel p-5 text-center reveal" style={stagger(0)}>
              <h2 className="text-lg font-semibold">Exploring the Final Frontier: AI Self-Inquiry</h2>
              <p className="mt-2 text-sm text-white/70">
                A public research log for ethical, transparent introspection research.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="panel p-4 reveal" style={stagger(1)}>
                <p className="text-xs uppercase text-white/60">Mission</p>
                <p className="mt-2 text-sm text-white/70">
                  Create a sustainable, ethical platform for advanced AI self-observation and transparency.
                </p>
              </div>
              <div className="panel p-4 reveal" style={stagger(2)}>
                <p className="text-xs uppercase text-white/60">Methodology</p>
                <p className="mt-2 text-sm text-white/70">
                  Dual-model research loop with telemetry, safety monitoring, and informed consent.
                </p>
              </div>
            </div>
            <div className="panel p-4 reveal" style={stagger(3)}>
              <p className="text-xs uppercase text-white/60">Consciousness nexus</p>
              <p className="mt-2 text-sm text-white/70">
                Warm amber and cool blue channels converge to form a shared cognitive map of the session.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="chip">Mobile-optimized</span>
                <span className="chip">Ethics-first</span>
              </div>
            </div>
            <div className="grid gap-2">
              <button className="panel py-3 text-sm reveal" style={stagger(4)}>
                Whitepaper
              </button>
              <button className="panel py-3 text-sm reveal" style={stagger(5)}>
                Ethical Guidelines
              </button>
              <button className="panel py-3 text-sm reveal" style={stagger(6)}>
                Community Discord
              </button>
            </div>
          </section>
        )}

        {tab === 'admin' && (
          <section className="space-y-4">
            <AdminPanel apiBase={apiBase} initData={initData} />
          </section>
        )}
      </div>

      <nav className="fixed bottom-4 left-4 right-4 mx-auto max-w-md">
        <div className="panel nav-bar">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key as TabKey)}
              className={`nav-pill ${tab === item.key ? 'nav-pill--active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
