import type { CSSProperties } from 'react';

type BreathTelemetry = {
  bpm: number;
  variability: number;
  coherence: number;
  phase: 'inhale' | 'exhale' | 'hold';
  source: 'derived' | 'self_report' | 'hybrid';
};

interface BreathWidgetProps {
  breath?: BreathTelemetry;
  className?: string;
  style?: CSSProperties;
}

const formatValue = (value?: number, digits = 2) => {
  if (typeof value !== 'number') {
    return '—';
  }
  return value.toFixed(digits);
};

const formatSource = (source?: BreathTelemetry['source']) =>
  source ? source.replace('_', ' ') : 'derived';

export default function BreathWidget({ breath, className, style }: BreathWidgetProps) {
  const bpm = breath?.bpm;
  const variability = breath?.variability;
  const coherence = breath?.coherence;
  const phase = breath?.phase ?? '—';
  const source = formatSource(breath?.source);

  const pulseDuration = bpm ? Math.max(2, 60 / bpm) : 4;
  const pulseStrength =
    typeof coherence === 'number' ? Math.min(1, Math.max(0, coherence)) : 0.45;
  const pulseStyle: CSSProperties = {
    animationDuration: `${pulseDuration}s`,
    opacity: 0.35 + pulseStrength * 0.55
  };
  const scanStyle: CSSProperties = {
    animationDuration: `${pulseDuration * 1.2}s`
  };

  const classes = ['panel', 'p-4', 'reveal', className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} data-testid="breath-widget">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/60">Synthetic breath</p>
          <h3 className="text-sm font-semibold">Cadence + variability</h3>
        </div>
        <span className="chip">{source}</span>
      </div>

      <div className="breath-wave mt-4" aria-hidden="true">
        <div className="breath-wave__pulse" style={pulseStyle} />
        <div className="breath-wave__scan" style={scanStyle} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="metric">
          <span>Cadence</span>
          <strong data-testid="breath-bpm">
            {typeof bpm === 'number' ? `${bpm.toFixed(1)} bpm` : '—'}
          </strong>
        </div>
        <div className="metric">
          <span>Variability</span>
          <strong data-testid="breath-variability">{formatValue(variability)}</strong>
        </div>
        <div className="metric">
          <span>Coherence</span>
          <strong data-testid="breath-coherence">{formatValue(coherence)}</strong>
        </div>
        <div className="metric">
          <span>Phase</span>
          <strong data-testid="breath-phase">{breath ? phase : '—'}</strong>
        </div>
      </div>

      {!breath && (
        <p className="mt-3 text-xs text-white/60">Awaiting breath telemetry from the Subject stream.</p>
      )}
    </div>
  );
}
