export interface AdminSettings {
  token_saver_enabled: boolean;
  updated_at?: string;
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
