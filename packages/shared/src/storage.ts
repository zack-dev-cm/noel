export interface UserRecord {
  id: string;
  telegram_id: string;
  telegram_username?: string | null;
  consented_at?: string | null;
  is_operator: boolean;
  ui_locale: 'en' | 'ru';
  ui_theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: string;
  user_id?: string | null;
  type: 'public' | 'private';
  status: 'pending' | 'running' | 'paused' | 'ended';
  researcher_model: string;
  subject_model: string;
  session_language: 'en' | 'ru';
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface TranscriptMessageRecord {
  id: string;
  session_id: string;
  seq: number;
  role: 'researcher' | 'subject' | 'system';
  content: string;
  token_count?: number | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  invoice_payload: string;
  amount: number;
  currency: 'XTR';
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
  paid_at?: string | null;
}

export interface EntitlementRecord {
  id: string;
  user_id: string;
  type: 'private_session' | 'intervention';
  remaining: number;
  expires_at?: string | null;
  created_at: string;
}

export interface AdminSettingsRecord {
  id: string;
  token_saver_enabled: boolean;
  updated_at: string;
  updated_by?: string | null;
}

export interface UserRepository {
  getByTelegramId(telegramId: string): Promise<UserRecord | null>;
  createUser(record: UserRecord): Promise<UserRecord>;
  updateConsent(userId: string, consentedAt: string): Promise<void>;
  updatePreferences(
    userId: string,
    input: { ui_locale?: UserRecord['ui_locale']; ui_theme?: UserRecord['ui_theme'] }
  ): Promise<UserRecord>;
}

export interface SessionRepository {
  createSession(record: SessionRecord): Promise<SessionRecord>;
  updateStatus(sessionId: string, status: SessionRecord['status']): Promise<void>;
  getSession(sessionId: string): Promise<SessionRecord | null>;
  updateSessionLanguage(sessionId: string, session_language: SessionRecord['session_language']): Promise<SessionRecord>;
}

export interface TranscriptRepository {
  appendMessage(record: TranscriptMessageRecord): Promise<void>;
  getMessagesAfterSeq(sessionId: string, afterSeq: number): Promise<TranscriptMessageRecord[]>;
}

export interface PaymentRepository {
  createInvoice(record: PaymentRecord): Promise<PaymentRecord>;
  markPaid(invoicePayload: string, paidAt: string): Promise<void>;
  getEntitlements(userId: string): Promise<EntitlementRecord[]>;
  addEntitlement(record: EntitlementRecord): Promise<void>;
  consumeEntitlement(userId: string, type: EntitlementRecord['type']): Promise<boolean>;
}

export interface AdminSettingsRepository {
  getSettings(): Promise<AdminSettingsRecord>;
  updateSettings(input: {
    token_saver_enabled: boolean;
    updated_by?: string | null;
  }): Promise<AdminSettingsRecord>;
}

export interface StorageRepositories {
  users: UserRepository;
  sessions: SessionRepository;
  transcripts: TranscriptRepository;
  payments: PaymentRepository;
  admin: AdminSettingsRepository;
}
