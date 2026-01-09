import { randomUUID } from 'crypto';

export interface InterventionItem {
  id: string;
  sessionId: string;
  userId: string;
  prompt: string;
  createdAt: string;
}

export class InterventionQueue {
  private queues = new Map<string, InterventionItem[]>();

  add(sessionId: string, userId: string, prompt: string): InterventionItem {
    const item: InterventionItem = {
      id: randomUUID(),
      sessionId,
      userId,
      prompt,
      createdAt: new Date().toISOString()
    };
    const list = this.queues.get(sessionId) ?? [];
    list.push(item);
    this.queues.set(sessionId, list);
    return item;
  }

  next(sessionId: string): InterventionItem | null {
    const list = this.queues.get(sessionId) ?? [];
    if (!list.length) {
      return null;
    }
    const item = list.shift() ?? null;
    this.queues.set(sessionId, list);
    return item;
  }
}
