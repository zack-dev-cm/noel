import { Pool } from 'pg';
import type {
  AdminSettingsRecord,
  EntitlementRecord,
  PaymentRecord,
  SessionRecord,
  StorageRepositories,
  TranscriptMessageRecord,
  UserRecord
} from '@noetic/shared';

export function createPostgresRepositories(databaseUrl: string): StorageRepositories {
  const pool = new Pool({ connectionString: databaseUrl });

  return {
    users: {
      async getByTelegramId(telegramId: string) {
        const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1 LIMIT 1', [telegramId]);
        return (result.rows[0] as UserRecord) ?? null;
      },
      async createUser(record: UserRecord) {
        await pool.query(
          'INSERT INTO users (id, telegram_id, telegram_username, consented_at, is_operator, ui_locale, ui_theme, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [
            record.id,
            record.telegram_id,
            record.telegram_username,
            record.consented_at,
            record.is_operator,
            record.ui_locale,
            record.ui_theme,
            record.created_at,
            record.updated_at
          ]
        );
        return record;
      },
      async updateConsent(userId: string, consentedAt: string) {
        await pool.query('UPDATE users SET consented_at = $1, updated_at = NOW() WHERE id = $2', [
          consentedAt,
          userId
        ]);
      },
      async updatePreferences(
        userId: string,
        input: { ui_locale?: UserRecord['ui_locale']; ui_theme?: UserRecord['ui_theme'] }
      ) {
        const current = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
        const record = current.rows[0] as UserRecord | undefined;
        if (!record) {
          throw new Error('user_not_found');
        }
        const nextLocale = input.ui_locale ?? record.ui_locale;
        const nextTheme = input.ui_theme ?? record.ui_theme;
        const result = await pool.query(
          'UPDATE users SET ui_locale = $1, ui_theme = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
          [nextLocale, nextTheme, userId]
        );
        return result.rows[0] as UserRecord;
      }
    },
    sessions: {
      async createSession(record: SessionRecord) {
        await pool.query(
          'INSERT INTO sessions (id, user_id, type, status, researcher_model, subject_model, session_language, created_at, started_at, ended_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [
            record.id,
            record.user_id,
            record.type,
            record.status,
            record.researcher_model,
            record.subject_model,
            record.session_language,
            record.created_at,
            record.started_at,
            record.ended_at
          ]
        );
        return record;
      },
      async updateStatus(sessionId: string, status: SessionRecord['status']) {
        await pool.query('UPDATE sessions SET status = $1 WHERE id = $2', [status, sessionId]);
      },
      async getSession(sessionId: string) {
        const result = await pool.query('SELECT * FROM sessions WHERE id = $1 LIMIT 1', [sessionId]);
        return (result.rows[0] as SessionRecord) ?? null;
      },
      async updateSessionLanguage(sessionId: string, session_language: SessionRecord['session_language']) {
        const result = await pool.query(
          'UPDATE sessions SET session_language = $1 WHERE id = $2 RETURNING *',
          [session_language, sessionId]
        );
        if (!result.rows[0]) {
          throw new Error('session_not_found');
        }
        return result.rows[0] as SessionRecord;
      }
    },
    transcripts: {
      async appendMessage(record: TranscriptMessageRecord) {
        await pool.query(
          'INSERT INTO transcript_messages (id, session_id, seq, role, content, token_count, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [
            record.id,
            record.session_id,
            record.seq,
            record.role,
            record.content,
            record.token_count,
            record.created_at
          ]
        );
      },
      async getMessagesAfterSeq(sessionId: string, afterSeq: number) {
        const result = await pool.query(
          'SELECT * FROM transcript_messages WHERE session_id = $1 AND seq > $2 ORDER BY seq ASC',
          [sessionId, afterSeq]
        );
        return result.rows as TranscriptMessageRecord[];
      }
    },
    payments: {
      async createInvoice(record: PaymentRecord) {
        await pool.query(
          'INSERT INTO payments (id, user_id, invoice_payload, amount, currency, status, created_at, paid_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [
            record.id,
            record.user_id,
            record.invoice_payload,
            record.amount,
            record.currency,
            record.status,
            record.created_at,
            record.paid_at
          ]
        );
        return record;
      },
      async markPaid(invoicePayload: string, paidAt: string) {
        await pool.query('UPDATE payments SET status = $1, paid_at = $2 WHERE invoice_payload = $3', [
          'paid',
          paidAt,
          invoicePayload
        ]);
      },
      async getEntitlements(userId: string) {
        const result = await pool.query(
          'SELECT * FROM entitlements WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())',
          [userId]
        );
        return result.rows as EntitlementRecord[];
      },
      async addEntitlement(record: EntitlementRecord) {
        await pool.query(
          'INSERT INTO entitlements (id, user_id, type, remaining, expires_at, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
          [
            record.id,
            record.user_id,
            record.type,
            record.remaining,
            record.expires_at,
            record.created_at
          ]
        );
      },
      async consumeEntitlement(userId: string, type: EntitlementRecord['type']) {
        const result = await pool.query(
          `UPDATE entitlements
           SET remaining = remaining - 1
           WHERE id = (
             SELECT id FROM entitlements
             WHERE user_id = $1
               AND type = $2
               AND remaining > 0
               AND (expires_at IS NULL OR expires_at > NOW())
             ORDER BY created_at ASC
             LIMIT 1
           )
           RETURNING remaining`,
          [userId, type]
        );
        return Boolean(result.rowCount && result.rowCount > 0);
      }
    },
    admin: {
      async getSettings() {
        const result = await pool.query(
          'SELECT id, token_saver_enabled, updated_at, updated_by FROM admin_settings WHERE id = $1',
          ['default']
        );
        if (result.rows[0]) {
          return result.rows[0] as AdminSettingsRecord;
        }
        const now = new Date().toISOString();
        const insert = await pool.query(
          'INSERT INTO admin_settings (id, token_saver_enabled, updated_at, updated_by) VALUES ($1,$2,$3,$4) RETURNING id, token_saver_enabled, updated_at, updated_by',
          ['default', false, now, null]
        );
        return insert.rows[0] as AdminSettingsRecord;
      },
      async updateSettings(input: { token_saver_enabled: boolean; updated_by?: string | null }) {
        const now = new Date().toISOString();
        const result = await pool.query(
          `INSERT INTO admin_settings (id, token_saver_enabled, updated_at, updated_by)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (id)
           DO UPDATE SET token_saver_enabled = $2, updated_at = $3, updated_by = $4
           RETURNING id, token_saver_enabled, updated_at, updated_by`,
          ['default', input.token_saver_enabled, now, input.updated_by ?? null]
        );
        return result.rows[0] as AdminSettingsRecord;
      }
    }
  };
}
