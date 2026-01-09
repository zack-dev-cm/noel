import { EventEmitter } from 'events';
import type { StreamEvent } from '@noetic/shared';
import type { StreamBuffer } from '../storage/redis.js';

export class StreamService extends EventEmitter {
  private seqBySession = new Map<string, number>();

  constructor(private buffer: StreamBuffer) {
    super();
  }

  async publish(sessionId: string, event: Omit<StreamEvent, 'seq'>): Promise<StreamEvent> {
    const nextSeq = (this.seqBySession.get(sessionId) ?? 0) + 1;
    const enriched: StreamEvent = { ...event, seq: nextSeq };
    this.seqBySession.set(sessionId, nextSeq);
    await this.buffer.publish(sessionId, enriched);
    this.emit(sessionId, enriched);
    return enriched;
  }

  async replay(sessionId: string, afterSeq: number): Promise<StreamEvent[]> {
    return this.buffer.replay(sessionId, afterSeq);
  }

  subscribe(sessionId: string, handler: (event: StreamEvent) => void): () => void {
    this.on(sessionId, handler);
    return () => this.off(sessionId, handler);
  }
}

export function createStreamService(buffer: StreamBuffer) {
  return new StreamService(buffer);
}
