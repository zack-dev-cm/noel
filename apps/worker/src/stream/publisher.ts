import type { StreamEvent } from '@noetic/shared';

export interface StreamPublisher {
  publish(sessionId: string, event: StreamEvent): Promise<void>;
}

class HttpStreamPublisher implements StreamPublisher {
  constructor(private baseUrl: string, private token?: string) {}

  async publish(sessionId: string, event: StreamEvent): Promise<void> {
    await fetch(`${this.baseUrl}/api/stream/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'x-stream-token': this.token } : {})
      },
      body: JSON.stringify({ sessionId, event })
    });
  }
}

class ConsoleStreamPublisher implements StreamPublisher {
  async publish(_sessionId: string, event: StreamEvent): Promise<void> {
    console.log('[stream]', event);
  }
}

export function createStreamPublisher(): StreamPublisher {
  const baseUrl = process.env.STREAM_PUBLISH_URL;
  if (baseUrl) {
    return new HttpStreamPublisher(baseUrl, process.env.STREAM_PUBLISH_TOKEN);
  }
  return new ConsoleStreamPublisher();
}
