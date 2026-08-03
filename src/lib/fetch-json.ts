const MAX_ATTEMPTS = 2;
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Client-side JSON fetch that can never hang and tolerates transient
   network failures (dev-server route compilation, hot reloads, brief
   connectivity blips). Falls back to `fallback` when the payload is invalid
   or empty, and only logs an error once both attempts have failed. */
export async function fetchJson<T>(
  url: string,
  label: string,
  fallback: T,
  validate: (data: T) => boolean
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`${label} responded ${res.status}`);
      const data = (await res.json()) as T;
      if (validate(data)) return data;
      return fallback;
    } catch (error) {
      lastError = error;
    }
    if (attempt === 0) await delay(RETRY_DELAY_MS);
  }
  console.error(`[${label}]`, lastError);
  return fallback;
}
