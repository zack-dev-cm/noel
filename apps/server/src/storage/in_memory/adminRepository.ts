import type { AdminSettingsRecord, AdminSettingsRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

const serverBootTime = Date.now();

function resolveBooleanEnv(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return defaultValue;
}

function shouldForceStopOnBoot(settings: AdminSettingsRecord | null): boolean {
  if (!settings) {
    return false;
  }
  if (settings.session_stop_enabled) {
    return false;
  }
  const requireAdminStart = resolveBooleanEnv(process.env.REQUIRE_ADMIN_START_ON_BOOT, true);
  if (!requireAdminStart) {
    return false;
  }
  const updatedAt = Date.parse(settings.updated_at);
  if (!Number.isFinite(updatedAt)) {
    return true;
  }
  return updatedAt < serverBootTime;
}

export class InMemoryAdminRepository implements AdminSettingsRepository {
  constructor(private store: InMemoryStore) {}

  async getSettings(): Promise<AdminSettingsRecord> {
    if (!this.store.adminSettings) {
      const now = new Date().toISOString();
      this.store.adminSettings = {
        id: 'default',
        token_saver_enabled: false,
        session_stop_enabled: false,
        updated_at: now,
        updated_by: null
      };
      return this.store.adminSettings;
    }
    if (shouldForceStopOnBoot(this.store.adminSettings)) {
      const now = new Date().toISOString();
      this.store.adminSettings = {
        ...this.store.adminSettings,
        session_stop_enabled: true,
        updated_at: now
      };
    }
    return this.store.adminSettings;
  }

  async updateSettings(input: {
    token_saver_enabled: boolean;
    session_stop_enabled: boolean;
    updated_by?: string | null;
  }): Promise<AdminSettingsRecord> {
    const now = new Date().toISOString();
    const record: AdminSettingsRecord = {
      id: 'default',
      token_saver_enabled: input.token_saver_enabled,
      session_stop_enabled: input.session_stop_enabled,
      updated_at: now,
      updated_by: input.updated_by ?? null
    };
    this.store.adminSettings = record;
    return record;
  }
}
