import { useEffect, useState } from 'react';
import { getTelegramInitData } from '../hooks/useTelegram';
import type { Copy } from '../i18n';

interface AdminPanelProps {
  apiBase: string;
  initData: string;
  copy: Copy['admin'];
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

export default function AdminPanel({ apiBase, initData, copy }: AdminPanelProps) {
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
      setStatus(copy.missingAuth);
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
        setStatus(payload.settings.token_saver_enabled ? copy.enabled : copy.disabled);
      }
      if (payload.model_versions) {
        setModelVersions(payload.model_versions);
      }
    } catch {
      setStatus(copy.updateFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500">{copy.title}</p>
          <h3 className="mt-1 text-lg font-semibold">{copy.subtitle}</h3>
        </div>
        <button
          type="button"
          className={`toggle ${settings?.token_saver_enabled ? 'toggle--active' : ''}`}
          onClick={toggleSaver}
          disabled={loading || !settings}
          aria-pressed={settings?.token_saver_enabled}
        >
          <span className="toggle-dot" />
          {settings?.token_saver_enabled ? copy.toggleOn : copy.toggleOff}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {copy.description}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="panel panel-subtle p-3">
          <p className="text-xs uppercase text-slate-500">{copy.activeCapsTitle}</p>
          <p className="mt-1 text-sm text-slate-600">{copy.activeCapsBody}</p>
        </div>
        <div className="panel panel-subtle p-3">
          <p className="text-xs uppercase text-slate-500">{copy.saverCapsTitle}</p>
          <p className="mt-1 text-sm text-slate-600">{copy.saverCapsBody}</p>
        </div>
      </div>
      {modelVersions && (
        <div className="mt-4 panel panel-subtle p-3">
          <p className="text-xs uppercase text-slate-500">{copy.modelVersions}</p>
          <div className="mt-2 grid gap-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{copy.researcher}</span>
              <span className="font-mono text-slate-700">{modelVersions.researcher}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{copy.subject}</span>
              <span className="font-mono text-slate-700">{modelVersions.subject}</span>
            </div>
            {modelVersions.subject_fallback && (
              <div className="flex items-center justify-between">
                <span>{copy.subjectFallback}</span>
                <span className="font-mono text-slate-700">{modelVersions.subject_fallback}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {status && <p className="mt-3 text-xs text-slate-600">{status}</p>}
    </div>
  );
}
