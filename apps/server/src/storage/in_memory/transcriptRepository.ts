import type { TranscriptMessageRecord, TranscriptRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

export class InMemoryTranscriptRepository implements TranscriptRepository {
  constructor(private store: InMemoryStore) {}

  async appendMessage(record: TranscriptMessageRecord): Promise<void> {
    const list = this.store.transcripts.get(record.session_id) ?? [];
    list.push(record);
    this.store.transcripts.set(record.session_id, list);
  }

  async getMessagesAfterSeq(sessionId: string, afterSeq: number): Promise<TranscriptMessageRecord[]> {
    const list = this.store.transcripts.get(sessionId) ?? [];
    return list.filter((item) => item.seq > afterSeq);
  }
}
