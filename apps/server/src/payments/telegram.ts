const TELEGRAM_API_BASE = 'https://api.telegram.org';

export interface InvoiceRequest {
  title: string;
  description: string;
  payload: string;
  amount: number;
}

export async function createInvoiceLink(botToken: string, request: InvoiceRequest) {
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: request.title,
      description: request.description,
      payload: request.payload,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: request.title, amount: request.amount }]
    })
  });

  if (!response.ok) {
    throw new Error('invoice_failed');
  }

  const payload = (await response.json()) as { ok?: boolean; result?: string };
  if (!payload.ok || !payload.result) {
    throw new Error('invoice_invalid');
  }

  return payload.result;
}

export async function answerPreCheckoutQuery(botToken: string, queryId: string) {
  await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/answerPreCheckoutQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pre_checkout_query_id: queryId, ok: true })
  });
}
