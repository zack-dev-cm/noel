function isNumericTag(value: string): boolean {
  return /^[0-9]/.test(value);
}

function toTitleCase(value: string): string {
  if (!value) {
    return value;
  }
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function formatModelTag(modelId?: string | null): string | null {
  if (!modelId) {
    return null;
  }
  const trimmed = modelId.trim();
  if (!trimmed) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('gpt-')) {
    const parts = trimmed.split('-');
    const version = parts[1];
    return version ? `GPT-${version}` : 'GPT';
  }
  if (lower.startsWith('gemini-')) {
    const parts = trimmed.split('-');
    const variant = parts[1];
    if (!variant) {
      return 'Gemini';
    }
    const label = isNumericTag(variant) ? variant : toTitleCase(variant);
    return `Gemini ${label}`;
  }
  return trimmed;
}
