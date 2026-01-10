import type { SessionRecord, SessionRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

export class InMemorySessionRepository implements SessionRepository {
  constructor(private store: InMemoryStore) {}

  async createSession(record: SessionRecord): Promise<SessionRecord> {
    this.store.sessions.set(record.id, record);
    return record;
  }

  async updateStatus(sessionId: string, status: SessionRecord['status']): Promise<void> {
    const session = this.store.sessions.get(sessionId);
    if (!session) {
      return;
    }
    this.store.sessions.set(sessionId, { ...session, status });
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    return this.store.sessions.get(sessionId) ?? null;
  }

  async updateSessionLanguage(
    sessionId: string,
    session_language: SessionRecord['session_language']
  ): Promise<SessionRecord> {
    const session = this.store.sessions.get(sessionId);
    if (!session) {
      throw new Error('session_not_found');
    }
    const updated = { ...session, session_language };
    this.store.sessions.set(sessionId, updated);
    return updated;
  }
}
