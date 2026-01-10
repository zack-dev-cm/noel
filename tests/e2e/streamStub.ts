import type { Page } from '@playwright/test';

export async function installStreamStub(page: Page, payloads: unknown | unknown[]) {
  await page.addInitScript(
    ({ payloads: injectedPayloads }) => {
      class FakeWebSocket {
        url: string;
        onmessage: ((event: { data: string }) => void) | null = null;
        onclose: (() => void) | null = null;
        closed: boolean;
        timers: number[];

        constructor(url: string) {
          this.url = url;
          this.closed = false;
          this.timers = [];
          const items = Array.isArray(injectedPayloads) ? injectedPayloads : [injectedPayloads];
          items.forEach((payload, index) => {
            const timer = window.setTimeout(() => {
              if (this.closed || !this.onmessage) {
                return;
              }
              this.onmessage({ data: JSON.stringify(payload) });
            }, 50 + index * 60);
            this.timers.push(timer);
          });
        }

        close() {
          this.closed = true;
          this.timers.forEach((timer) => window.clearTimeout(timer));
          if (this.onclose) {
            this.onclose();
          }
        }
      }

      // @ts-expect-error override for test
      window.WebSocket = FakeWebSocket;
    },
    { payloads }
  );
}
