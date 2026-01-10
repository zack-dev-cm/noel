export interface AdminSettings {
  token_saver_enabled: boolean;
  updated_at?: string;
}

export interface SessionSettings {
  session_language: 'en' | 'ru';
}

export async function fetchAdminSettings(): Promise<AdminSettings | null> {
  const baseUrl =
    process.env.SETTINGS_API_BASE || process.env.INTERVENTION_API_BASE || process.env.STREAM_PUBLISH_URL;
  if (!baseUrl) {
    return null;
  }

  const headers: Record<string, string> = {};
  if (process.env.STREAM_PUBLISH_TOKEN) {
    headers['x-stream-token'] = process.env.STREAM_PUBLISH_TOKEN;
  }

  try {
    const response = await fetch(`${baseUrl}/api/admin/settings`, { headers });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as { settings?: AdminSettings };
    return payload.settings ?? null;
  } catch {
    return null;
  }
}

export async function fetchSessionSettings(sessionId: string): Promise<SessionSettings | null> {
  const baseUrl =
    process.env.SETTINGS_API_BASE || process.env.INTERVENTION_API_BASE || process.env.STREAM_PUBLISH_URL;
  if (!baseUrl) {
    return null;
  }

  const headers: Record<string, string> = {};
  if (process.env.STREAM_PUBLISH_TOKEN) {
    headers['x-stream-token'] = process.env.STREAM_PUBLISH_TOKEN;
  }

  try {
    const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/settings`, { headers });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as { session_language?: 'en' | 'ru' };
    if (payload.session_language !== 'en' && payload.session_language !== 'ru') {
      return null;
    }
    return { session_language: payload.session_language };
  } catch {
    return null;
  }
}
