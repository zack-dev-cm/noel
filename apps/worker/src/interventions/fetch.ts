export interface InterventionItem {
  id: string;
  sessionId: string;
  userId: string;
  prompt: string;
  createdAt: string;
}

export async function fetchNextIntervention(sessionId: string): Promise<InterventionItem | null> {
  const baseUrl = process.env.INTERVENTION_API_BASE;
  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl}/api/interventions/next?sessionId=${sessionId}`, {
    headers: {
      ...(process.env.INTERVENTION_API_TOKEN
        ? { 'x-intervention-token': process.env.INTERVENTION_API_TOKEN }
        : {})
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { intervention?: InterventionItem | null };
  return payload.intervention ?? null;
}
