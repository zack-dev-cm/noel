import type { Page } from '@playwright/test';

export async function installTelegramStub(page: Page, initDataOverride?: string) {
  const initData = initDataOverride ?? process.env.PLAYWRIGHT_INIT_DATA ?? '';
  await page.addInitScript(
    ({ initData: injectedInitData }) => {
      if (injectedInitData) {
        const params = new URLSearchParams(window.location.hash.replace('#', ''));
        params.set('tgWebAppData', injectedInitData);
        window.location.hash = params.toString();
      }
      window.Telegram = {
        WebApp: {
          initData: injectedInitData,
          ready: () => {},
          expand: () => {},
          setHeaderColor: () => {},
          openInvoice: () => {}
        }
      };
    },
    { initData }
  );
}
