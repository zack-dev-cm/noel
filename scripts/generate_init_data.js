const crypto = require('crypto');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

const userId = process.env.TELEGRAM_TEST_USER_ID || '100000';
const username = process.env.TELEGRAM_TEST_USERNAME || 'noel_test';
const firstName = process.env.TELEGRAM_TEST_FIRST_NAME || 'Noel';
const lastName = process.env.TELEGRAM_TEST_LAST_NAME || 'Test';
const authDate = Math.floor(Date.now() / 1000);

const user = JSON.stringify({
  id: Number(userId),
  username,
  first_name: firstName,
  last_name: lastName
});

const params = new URLSearchParams({
  auth_date: String(authDate),
  user
});

const dataCheckString = [...params.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
params.append('hash', hash);

console.log(params.toString());
