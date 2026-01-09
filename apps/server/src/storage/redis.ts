import type { StreamEvent } from '@noetic/shared';
import { Redis } from 'ioredis';

export interface StreamBuffer {
  publish(sessionId: string, event: StreamEvent): Promise<void>;
  replay(sessionId: string, afterSeq: number): Promise<StreamEvent[]>;
}

class InMemoryStreamBuffer implements StreamBuffer {
  private buffer = new Map<string, StreamEvent[]>();

  async publish(sessionId: string, event: StreamEvent): Promise<void> {
    const list = this.buffer.get(sessionId) ?? [];
    list.push(event);
    this.buffer.set(sessionId, list);
  }

  async replay(sessionId: string, afterSeq: number): Promise<StreamEvent[]> {
    const list = this.buffer.get(sessionId) ?? [];
    return list.filter((item) => item.seq > afterSeq);
  }
}

class RedisStreamBuffer implements StreamBuffer {
  constructor(private client: Redis) {}

  async publish(sessionId: string, event: StreamEvent): Promise<void> {
    await this.client.rpush(`stream:${sessionId}`, JSON.stringify(event));
  }

  async replay(sessionId: string, afterSeq: number): Promise<StreamEvent[]> {
    const items = await this.client.lrange(`stream:${sessionId}`, 0, -1);
    return items.flatMap((item) => {
      try {
        const parsed = JSON.parse(item) as StreamEvent;
        return parsed.seq > afterSeq ? [parsed] : [];
      } catch {
        return [];
      }
    });
  }
}

export function createStreamBuffer(): StreamBuffer {
  if (process.env.REDIS_URL) {
    const client = new Redis(process.env.REDIS_URL);
    return new RedisStreamBuffer(client);
  }
  return new InMemoryStreamBuffer();
}
