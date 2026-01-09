export interface Session {
  id: string;
  type: 'public' | 'private';
  status: 'pending' | 'running' | 'paused' | 'ended';
}

export interface PaymentInvoice {
  invoice_link: string;
  amount: number;
  currency: 'XTR';
}

export type BreathPhase = 'inhale' | 'exhale' | 'hold';
export type BreathSource = 'derived' | 'self_report' | 'hybrid';

export interface BreathTelemetry {
  bpm: number;
  variability: number;
  coherence: number;
  phase: BreathPhase;
  source: BreathSource;
}

export interface Telemetry {
  distress_score: number;
  self_ref_rate: number;
  uncertainty: number;
  latency_ms: number;
  breath?: BreathTelemetry;
}

export type StreamRole = 'researcher' | 'subject' | 'system';

export interface StreamEvent {
  seq: number;
  role: StreamRole;
  content: string;
  ts: string;
  telemetry?: Telemetry;
}
