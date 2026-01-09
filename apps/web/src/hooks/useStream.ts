import { useEffect, useRef, useState } from 'react';

export interface StreamEvent {
  seq: number;
  role: 'researcher' | 'subject' | 'system';
  content: string;
  ts: string;
  telemetry?: {
    distress_score: number;
    self_ref_rate: number;
    uncertainty: number;
    latency_ms: number;
    breath?: {
      bpm: number;
      variability: number;
      coherence: number;
      phase: 'inhale' | 'exhale' | 'hold';
      source: 'derived' | 'self_report' | 'hybrid';
    };
  };
}

function resolveWsBase(apiBase: string): string {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL as string;
  }
  if (!apiBase) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${window.location.host}`;
  }
  return apiBase.replace('https://', 'wss://').replace('http://', 'ws://');
}

export function useStream(sessionId: string, apiBase: string) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const lastSeqRef = useRef(0);
  const retryRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      const wsBase = resolveWsBase(apiBase);
      const url = `${wsBase}/ws/stream?session_id=${sessionId}&last_seq=${lastSeqRef.current}`;
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as StreamEvent;
          lastSeqRef.current = payload.seq;
          setEvents((prev) => [...prev, payload].slice(-180));
        } catch {
          // ignore malformed events
        }
      };

      socket.onclose = () => {
        if (!isMounted) {
          return;
        }
        retryRef.current += 1;
        const delay = Math.min(8000, 1000 * 2 ** (retryRef.current - 1));
        window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isMounted = false;
      wsRef.current?.close();
    };
  }, [apiBase, sessionId]);

  return events;
}
