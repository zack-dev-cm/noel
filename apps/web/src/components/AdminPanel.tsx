import { useEffect, useState } from 'react';
import { getTelegramInitData } from '../hooks/useTelegram';

interface AdminPanelProps {
  apiBase: string;
  initData: string;
}

type AdminSettings = {
  token_saver_enabled: boolean;
  updated_at?: string;
};

type ModelVersions = {
  researcher: string;
  subject: string;
  subject_fallback?: string;
};

export default function AdminPanel({ apiBase, initData }: AdminPanelProps) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [modelVersions, setModelVersions] = useState<ModelVersions | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const resolvedInitData = initData || getTelegramInitData() || import.meta.env.VITE_FAKE_INIT_DATA || '';

  useEffect(() => {
    const load = async () => {
      if (!resolvedInitData) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/api/admin/settings`, {
          headers: {
            'x-telegram-init-data': resolvedInitData
          }
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { settings?: AdminSettings; model_versions?: ModelVersions };
        if (payload.settings) {
          setSettings(payload.settings);
        }
        if (payload.model_versions) {
          setModelVersions(payload.model_versions);
        }
      } catch {
        // ignore
      }
    };
    void load();
  }, [apiBase, resolvedInitData]);

  const toggleSaver = async () => {
    if (!resolvedInitData || !settings) {
      setStatus('Missing admin auth.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch(`${apiBase}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: resolvedInitData, tokenSaverEnabled: !settings.token_saver_enabled })
      });
      if (!response.ok) {
        throw new Error('update_failed');
      }
      const payload = (await response.json()) as { settings?: AdminSettings; model_versions?: ModelVersions };
      if (payload.settings) {
        setSettings(payload.settings);
        setStatus(payload.settings.token_saver_enabled ? 'Token saver enabled.' : 'Token saver disabled.');
      }
      if (payload.model_versions) {
        setModelVersions(payload.model_versions);
      }
    } catch {
      setStatus('Unable to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/60">Admin controls</p>
          <h3 className="mt-1 text-lg font-semibold">Token saver mode</h3>
        </div>
        <button
          className={`toggle ${settings?.token_saver_enabled ? 'toggle--active' : ''}`}
          onClick={toggleSaver}
          disabled={loading || !settings}
          aria-pressed={settings?.token_saver_enabled}
        >
          <span className="toggle-dot" />
          {settings?.token_saver_enabled ? 'On' : 'Off'}
        </button>
      </div>
      <p className="mt-3 text-sm text-white/70">
        Reduces per-session budgets and caps response length to keep costs predictable while preserving
        signal quality.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="panel panel-subtle p-3">
          <p className="text-xs uppercase text-white/50">Active caps</p>
          <p className="mt-1 text-sm text-white/70">Researcher: ~240 tokens · Subject: ~280 tokens</p>
        </div>
        <div className="panel panel-subtle p-3">
          <p className="text-xs uppercase text-white/50">Saver caps</p>
          <p className="mt-1 text-sm text-white/70">Researcher: ~160 tokens · Subject: ~200 tokens</p>
        </div>
      </div>
      {modelVersions && (
        <div className="mt-4 panel panel-subtle p-3">
          <p className="text-xs uppercase text-white/50">Model versions</p>
          <div className="mt-2 grid gap-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Researcher</span>
              <span className="font-mono text-white/80">{modelVersions.researcher}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subject</span>
              <span className="font-mono text-white/80">{modelVersions.subject}</span>
            </div>
            {modelVersions.subject_fallback && (
              <div className="flex items-center justify-between">
                <span>Subject fallback</span>
                <span className="font-mono text-white/80">{modelVersions.subject_fallback}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {status && <p className="mt-3 text-xs text-white/60">{status}</p>}
    </div>
  );
}
