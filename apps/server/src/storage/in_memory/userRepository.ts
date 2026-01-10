import type { UserRecord, UserRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

export class InMemoryUserRepository implements UserRepository {
  constructor(private store: InMemoryStore) {}

  async getByTelegramId(telegramId: string): Promise<UserRecord | null> {
    for (const user of this.store.users.values()) {
      if (user.telegram_id === telegramId) {
        return user;
      }
    }
    return null;
  }

  async createUser(record: UserRecord): Promise<UserRecord> {
    this.store.users.set(record.id, record);
    return record;
  }

  async updateConsent(userId: string, consentedAt: string): Promise<void> {
    const user = this.store.users.get(userId);
    if (!user) {
      return;
    }
    this.store.users.set(userId, { ...user, consented_at: consentedAt });
  }

  async updatePreferences(
    userId: string,
    input: { ui_locale?: UserRecord['ui_locale']; ui_theme?: UserRecord['ui_theme'] }
  ): Promise<UserRecord> {
    const user = this.store.users.get(userId);
    if (!user) {
      throw new Error('user_not_found');
    }
    const updated: UserRecord = {
      ...user,
      ui_locale: input.ui_locale ?? user.ui_locale,
      ui_theme: input.ui_theme ?? user.ui_theme
    };
    this.store.users.set(userId, updated);
    return updated;
  }
}
