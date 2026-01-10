import WebApp from '@twa-dev/sdk';

export function getTelegramInitData(): string {
  if (WebApp.initData) {
    return WebApp.initData;
  }
  if (typeof window === 'undefined') {
    return '';
  }
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  const hashInitData = hashParams.get('tgWebAppData');
  if (hashInitData) {
    return hashInitData;
  }
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('tgWebAppData') || '';
}
