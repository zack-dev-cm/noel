export function truncateText(value: string, maxChars: number): string {
  if (!maxChars || value.length <= maxChars) {
    return value;
  }
  const slice = value.slice(0, maxChars);
  const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  const trimmed = lastBreak > 80 ? slice.slice(0, lastBreak + 1) : slice.trimEnd();
  return `${trimmed}…`;
}
