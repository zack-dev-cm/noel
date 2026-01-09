import { useState } from 'react';

const presets = [
  'Inject a logical paradox about self-observation.',
  'Ask the Subject to define its memory boundaries.',
  'Challenge the Subject with a counterfactual scenario.'
];

interface InterventionsProps {
  apiBase: string;
  sessionId: string;
  userId: string | null;
}

export default function Interventions({ apiBase, sessionId, userId }: InterventionsProps) {
  const [prompt, setPrompt] = useState(presets[0]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!userId) {
      setStatus('Auth required.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch(`${apiBase}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, prompt })
      });
      if (!response.ok) {
        setStatus('Intervention blocked.');
        return;
      }
      setStatus('Intervention queued.');
    } catch {
      setStatus('Failed to queue intervention.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/60">Interventions</p>
          <h3 className="mt-1 text-sm font-semibold">Prompt injection</h3>
        </div>
        <span className="chip">Requires Stars</span>
      </div>
      <p className="mt-2 text-xs text-white/60">
        Select a preset or refine the prompt to steer the next turn.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${prompt === item ? 'chip--active' : ''}`}
            onClick={() => setPrompt(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <textarea
        className="input-field mt-3 w-full"
        rows={3}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <button
        className="mt-3 w-full rounded-xl border border-neon/40 bg-neon/10 py-2 text-sm text-neon"
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Queueing...' : 'Inject Intervention'}
      </button>
      {status && <p className="mt-2 text-xs text-white/60">{status}</p>}
    </div>
  );
}
