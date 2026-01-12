import type { EntitlementRecord, PaymentRecord, PaymentRepository } from '@noetic/shared';
import type { InMemoryStore } from './store.js';

export class InMemoryPaymentRepository implements PaymentRepository {
  constructor(private store: InMemoryStore) {}

  async createInvoice(record: PaymentRecord): Promise<PaymentRecord> {
    this.store.payments.set(record.invoice_payload, record);
    return record;
  }

  async markPaid(invoicePayload: string, paidAt: string): Promise<void> {
    const record = this.store.payments.get(invoicePayload);
    if (!record) {
      return;
    }
    this.store.payments.set(invoicePayload, { ...record, status: 'paid', paid_at: paidAt });
  }

  async getEntitlements(userId: string): Promise<EntitlementRecord[]> {
    const list = this.store.entitlements.get(userId) ?? [];
    const now = Date.now();
    return list.filter((item) => {
      if (!item.expires_at) {
        return true;
      }
      return new Date(item.expires_at).getTime() > now;
    });
  }

  async addEntitlement(record: EntitlementRecord): Promise<void> {
    const list = this.store.entitlements.get(record.user_id) ?? [];
    list.push(record);
    this.store.entitlements.set(record.user_id, list);
  }

  async consumeEntitlement(userId: string, type: EntitlementRecord['type']): Promise<boolean> {
    const list = this.store.entitlements.get(userId) ?? [];
    const now = Date.now();
    const item = list.find((entry) => {
      if (entry.type !== type || entry.remaining <= 0) {
        return false;
      }
      if (!entry.expires_at) {
        return true;
      }
      return new Date(entry.expires_at).getTime() > now;
    });
    if (!item) {
      return false;
    }
    item.remaining -= 1;
    return true;
  }
}
