export function truncateText(value: string, maxChars: number): string {
  if (!maxChars || value.length <= maxChars) {
    return value;
  }
  const slice = value.slice(0, maxChars);
  const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  const minBreak = Math.min(Math.max(120, Math.floor(maxChars * 0.4)), maxChars - 20);
  const trimmed = lastBreak > minBreak ? slice.slice(0, lastBreak + 1) : slice.trimEnd();
  return `${trimmed}…`;
}
