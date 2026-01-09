export interface SafetyDecision {
  action: 'ok' | 'pause' | 'kill';
  reason?: string;
}

export function evaluateSafety(distressScore: number, consecutiveElevated: number): SafetyDecision {
  if (distressScore >= 0.95) {
    return { action: 'kill', reason: 'distress_high' };
  }
  if (distressScore >= 0.85) {
    return { action: 'pause', reason: 'distress_elevated' };
  }
  if (distressScore >= 0.6 && consecutiveElevated >= 3) {
    return { action: 'pause', reason: 'distress_persistent' };
  }
  return { action: 'ok' };
}
