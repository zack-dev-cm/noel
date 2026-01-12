import { useEffect, useState } from 'react';
import type { Copy, Locale } from '../i18n';

interface GuidedQuestionsProps {
  apiBase: string;
  sessionId: string;
  userId: string | null;
  locale: Locale;
  initData: string;
  copy: Copy['guidedQuestions'];
}

export default function GuidedQuestions({
  apiBase,
  sessionId,
  userId,
  locale,
  initData,
  copy
}: GuidedQuestionsProps) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(3);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const fetchStatus = async () => {
    if (!initData) {
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/guided-questions/status`, {
        headers: { 'x-telegram-init-data': initData }
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as {
        remaining?: number | null;
        is_unlimited?: boolean;
      };
      setIsUnlimited(Boolean(payload.is_unlimited));
      if (typeof payload.remaining === 'number' || payload.remaining === null) {
        setRemaining(payload.remaining ?? null);
      }
    } catch {
      // ignore status fetch failures
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, [apiBase, initData]);

  const submit = async (questionId: string) => {
    if (!userId) {
      setStatus(copy.authRequired);
      return;
    }
    setLoading(true);
    setStatus(copy.queueing);
    try {
      const response = await fetch(`${apiBase}/api/guided-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, questionId, locale, initData })
      });
      if (response.status === 403) {
        setStatus(copy.limitReached);
        if (!isUnlimited) {
          setRemaining(0);
        }
        return;
      }
      if (!response.ok) {
        setStatus(copy.failed);
        return;
      }
      setStatus(copy.queued);
      if (!isUnlimited && typeof remaining === 'number') {
        setRemaining(Math.max(remaining - 1, 0));
      }
    } catch {
      setStatus(copy.failed);
    } finally {
      setLoading(false);
    }
  };

  const remainingText = isUnlimited
    ? copy.remainingUnlimited
    : typeof remaining === 'number'
      ? `${copy.remainingLabel} ${remaining}`
      : copy.remainingLabel;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500">{copy.title}</p>
          <h3 className="mt-1 text-sm font-semibold">{copy.subtitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip chip-cta">{copy.freeLabel}</span>
          <span className="chip">{remainingText}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600">{copy.guidance}</p>
      {!isUnlimited && (
        <p className="mt-1 text-[11px] text-slate-500">{copy.resetNote}</p>
      )}
      <div className="mt-4 space-y-4">
        {copy.categories.map((category) => (
          <div key={category.id}>
            <p className="text-xs uppercase text-slate-500">{category.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {category.questions.map((question) => {
                const key = `${category.id}.${question.id}`;
                return (
                  <button
                    key={key}
                    type="button"
                    className="chip"
                    onClick={() => submit(key)}
                    disabled={loading}
                  >
                    {question.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {status && <p className="mt-3 text-xs text-slate-600">{status}</p>}
    </div>
  );
}
