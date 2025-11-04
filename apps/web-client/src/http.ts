import type { HttpResult } from './types';

export async function httpRequest<T>(
  url: string,
  timeoutMs: number
): Promise<HttpResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (response.ok) {
      const data = await response.json();
      return { status: response.status, headers, data };
    } else {
      const error = await response.text();
      return { status: response.status, headers, error };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 0, headers: {}, error: 'Client timeout' };
    }
    return { status: 0, headers: {}, error: 'Network error' };
  }
}