export function enableTracing() {
  if (process.env.NODE_ENV !== 'production') {
    process.env.OPENAI_TRACE = '1';
  }
}
