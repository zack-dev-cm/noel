import WebApp from '@twa-dev/sdk';

export function getTelegramInitData(): string {
  return WebApp.initData || '';
}
