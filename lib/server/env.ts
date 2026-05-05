type NetlifyEnvReader = {
  get?: (name: string) => string | undefined;
};

type NetlifyGlobal = typeof globalThis & {
  Netlify?: {
    env?: NetlifyEnvReader;
  };
};

export function readServerEnv(name: string): string | undefined {
  const processValue = process.env[name]?.trim();

  if (processValue) {
    return processValue;
  }

  const netlifyEnv = (globalThis as NetlifyGlobal).Netlify?.env;
  const netlifyValue = netlifyEnv?.get?.(name)?.trim();

  return netlifyValue || undefined;
}

export function isPlaceholderSecret(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return /^\[.*\]$/.test(value) || /PASTE|YOUR-|REPLACE/i.test(value);
}
