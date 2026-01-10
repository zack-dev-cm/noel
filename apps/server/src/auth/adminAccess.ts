export type AdminAccessList = {
  ids: Set<string>;
  usernames: Set<string>;
};

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, '').toLowerCase();
}

function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

export function parseAdminIdentifiers(raw: string | undefined): AdminAccessList {
  const ids = new Set<string>();
  const usernames = new Set<string>();

  (raw || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      if (isNumeric(value)) {
        ids.add(value);
        return;
      }
      const normalized = normalizeUsername(value);
      if (normalized) {
        usernames.add(normalized);
      }
    });

  return { ids, usernames };
}

export function isAdminUser(list: AdminAccessList, telegramId?: string | null, username?: string | null): boolean {
  if (telegramId && list.ids.has(String(telegramId))) {
    return true;
  }
  if (username) {
    const normalized = normalizeUsername(username);
    if (normalized && list.usernames.has(normalized)) {
      return true;
    }
  }
  return false;
}
