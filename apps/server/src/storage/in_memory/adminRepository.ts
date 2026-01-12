import type { AdminSettingsRecord, AdminSettingsRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

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
