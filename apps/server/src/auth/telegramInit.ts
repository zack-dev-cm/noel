import crypto from 'crypto';

export interface ParsedInitData {
  user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  auth_date?: number;
}

export interface InitDataValidationResult {
  ok: boolean;
  data?: ParsedInitData;
  error?: string;
}

export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number
): InitDataValidationResult {
  if (!initData) {
    return { ok: false, error: 'missing_init_data' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { ok: false, error: 'missing_hash' };
  }

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) {
    return { ok: false, error: 'invalid_hash' };
  }

  const authDate = Number(params.get('auth_date') || 0);
  if (maxAgeSeconds > 0 && authDate > 0) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - authDate > maxAgeSeconds) {
      return { ok: false, error: 'init_data_expired' };
    }
  }

  let user: ParsedInitData['user'];
  const userRaw = params.get('user');
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (error) {
      return { ok: false, error: 'invalid_user_json' };
    }
  }

  return {
    ok: true,
    data: {
      user,
      auth_date: authDate
    }
  };
}
