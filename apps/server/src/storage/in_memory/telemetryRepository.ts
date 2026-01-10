import type { TelemetryEventRecord, TelemetryRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

export class InMemoryTelemetryRepository implements TelemetryRepository {
  constructor(private store: InMemoryStore) {}

  async appendTelemetry(record: TelemetryEventRecord): Promise<void> {
    const list = this.store.telemetry.get(record.session_id) ?? [];
    list.push(record);
    this.store.telemetry.set(record.session_id, list);
  }

  async getTelemetryAfterSeq(sessionId: string, afterSeq: number): Promise<TelemetryEventRecord[]> {
    const list = this.store.telemetry.get(sessionId) ?? [];
    return list.filter((item) => item.seq > afterSeq);
  }
}
