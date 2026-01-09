import { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { getTelegramInitData } from '../hooks/useTelegram';

interface StarsPanelProps {
  apiBase: string;
}

export default function StarsPanel({ apiBase }: StarsPanelProps) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const requestInvoice = async (type: 'stargazer' | 'cosmic_patron' | 'universal_architect') => {
    const initData = getTelegramInitData() || import.meta.env.VITE_FAKE_INIT_DATA || '';
    if (!initData) {
      setStatus('Missing initData. Open inside Telegram.');
      return;
    }

    setLoading(type);
    setStatus('');
    try {
      const response = await fetch(`${apiBase}/api/payments/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, initData })
      });
      if (!response.ok) {
        throw new Error('invoice_failed');
      }
      const data = (await response.json()) as { invoice_link: string };
      if (WebApp?.openInvoice) {
        WebApp.openInvoice(data.invoice_link, (result) => {
          if (result === 'paid') {
            setStatus('Payment confirmed.');
          }
        });
      } else {
        window.open(data.invoice_link, '_blank');
      }
    } catch {
      setStatus('Unable to create invoice.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold">Support with Stars</h3>
      <p className="mt-2 text-xs text-white/60">
        Choose a tier to fund sessions or unlock interventions.
      </p>
      <div className="mt-3 grid gap-2 text-sm">
        <button
          className="rounded-xl border border-amber-300/40 bg-amber-500/10 py-2 text-amber-200"
          onClick={() => requestInvoice('stargazer')}
          disabled={loading === 'stargazer'}
        >
          {loading === 'stargazer' ? 'Creating...' : 'Stargazer (10★)'}
        </button>
        <button
          className="rounded-xl border border-neon/40 bg-neon/10 py-2 text-neon"
          onClick={() => requestInvoice('cosmic_patron')}
          disabled={loading === 'cosmic_patron'}
        >
          {loading === 'cosmic_patron' ? 'Creating...' : 'Cosmic Patron (100★)'}
        </button>
        <button
          className="rounded-xl border border-purple-300/40 bg-purple-500/10 py-2 text-purple-200"
          onClick={() => requestInvoice('universal_architect')}
          disabled={loading === 'universal_architect'}
        >
          {loading === 'universal_architect' ? 'Creating...' : 'Universal Architect (1000★)'}
        </button>
      </div>
      {status && <p className="mt-2 text-xs text-white/60">{status}</p>}
    </div>
  );
}
