import type {
  EntitlementRecord,
  PaymentRecord,
  SessionRecord,
  TelemetryEventRecord,
  TranscriptMessageRecord,
  UserRecord
} from '@noetic/shared';

export class InMemoryStore {
  users = new Map<string, UserRecord>();
  sessions = new Map<string, SessionRecord>();
  transcripts = new Map<string, TranscriptMessageRecord[]>();
  telemetry = new Map<string, TelemetryEventRecord[]>();
  payments = new Map<string, PaymentRecord>();
  entitlements = new Map<string, EntitlementRecord[]>();
  adminSettings?: {
    id: string;
    token_saver_enabled: boolean;
    updated_at: string;
    updated_by?: string | null;
  };
}
