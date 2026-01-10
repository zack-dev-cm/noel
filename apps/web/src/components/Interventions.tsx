import { useEffect, useState } from 'react';
import type { Copy } from '../i18n';

interface InterventionsProps {
  apiBase: string;
  sessionId: string;
  userId: string | null;
  copy: Copy['interventions'];
}

export default function Interventions({ apiBase, sessionId, userId, copy }: InterventionsProps) {
  const [prompt, setPrompt] = useState(copy.presets[0]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!copy.presets.includes(prompt)) {
      setPrompt(copy.presets[0]);
    }
  }, [copy.presets, prompt]);

  const submit = async () => {
    if (!userId) {
      setStatus(copy.authRequired);
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
        setStatus(copy.blocked);
        return;
      }
      setStatus(copy.queued);
    } catch {
      setStatus(copy.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500">{copy.title}</p>
          <h3 className="mt-1 text-sm font-semibold">{copy.subtitle}</h3>
        </div>
        <span className="chip">{copy.requiresStars}</span>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        {copy.guidance}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {copy.presets.map((item) => (
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
        className="button-primary mt-3 w-full"
        type="button"
        onClick={submit}
        disabled={loading}
      >
        {loading ? copy.queueing : copy.submit}
      </button>
      {status && <p className="mt-2 text-xs text-slate-600">{status}</p>}
    </div>
  );
}
