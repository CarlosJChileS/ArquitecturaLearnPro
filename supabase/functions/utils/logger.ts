export function createLogger(namespace: string) {
  return (step: string, details?: unknown) => {
    if (Deno.env.get('LOG_LEVEL') !== 'silent') {
      const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
      console.log(`[${namespace}] ${step}${detailsStr}`);
    }
  };
}
