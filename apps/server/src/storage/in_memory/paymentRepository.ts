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
    return this.store.entitlements.get(userId) ?? [];
  }

  async addEntitlement(record: EntitlementRecord): Promise<void> {
    const list = this.store.entitlements.get(record.user_id) ?? [];
    list.push(record);
    this.store.entitlements.set(record.user_id, list);
  }

  async consumeEntitlement(userId: string, type: EntitlementRecord['type']): Promise<boolean> {
    const list = this.store.entitlements.get(userId) ?? [];
    const item = list.find((entry) => entry.type === type && entry.remaining > 0);
    if (!item) {
      return false;
    }
    item.remaining -= 1;
    return true;
  }
}
