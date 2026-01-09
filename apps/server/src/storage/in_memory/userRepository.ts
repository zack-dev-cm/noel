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
}
