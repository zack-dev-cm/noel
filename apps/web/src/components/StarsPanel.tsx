import { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { getTelegramInitData } from '../hooks/useTelegram';
import type { Copy } from '../i18n';

interface StarsPanelProps {
  apiBase: string;
  copy: Copy['starsPanel'];
}

export default function StarsPanel({ apiBase, copy }: StarsPanelProps) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const requestInvoice = async (type: 'stargazer' | 'cosmic_patron' | 'universal_architect') => {
    const initData = getTelegramInitData() || import.meta.env.VITE_FAKE_INIT_DATA || '';
    if (!initData) {
      setStatus(copy.missingInitData);
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
            setStatus(copy.paymentConfirmed);
          }
        });
      } else {
        window.open(data.invoice_link, '_blank');
      }
    } catch {
      setStatus(copy.invoiceFailed);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold">{copy.title}</h3>
      <p className="mt-2 text-xs text-slate-600">
        {copy.subtitle}
      </p>
      <div className="mt-3 grid gap-2 text-sm">
        <button
          type="button"
          className="tier-button tier-button--stargazer"
          onClick={() => requestInvoice('stargazer')}
          disabled={loading === 'stargazer'}
        >
          {loading === 'stargazer' ? copy.creating : copy.stargazer}
        </button>
        <button
          type="button"
          className="tier-button tier-button--cosmic"
          onClick={() => requestInvoice('cosmic_patron')}
          disabled={loading === 'cosmic_patron'}
        >
          {loading === 'cosmic_patron' ? copy.creating : copy.cosmicPatron}
        </button>
        <button
          type="button"
          className="tier-button tier-button--universal"
          onClick={() => requestInvoice('universal_architect')}
          disabled={loading === 'universal_architect'}
        >
          {loading === 'universal_architect' ? copy.creating : copy.universalArchitect}
        </button>
      </div>
      {status && <p className="mt-2 text-xs text-slate-600">{status}</p>}
    </div>
  );
}
