import { config } from '../config';

interface RequestOptions extends RequestInit {
  authToken?: string | null;
  parseJson?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authToken, headers, parseJson = true, ...rest } = options;
  const url = `${config.apiUrl}${path}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let details: unknown = undefined;
    try {
      details = await response.json();
    } catch (error) {
      // ignore parse errors, response has no JSON body
    }

    const error = new Error(
      typeof details === 'object' && details !== null && 'message' in details
        ? String((details as { message?: unknown }).message)
        : `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number; data?: unknown }).status = response.status;
    (error as Error & { status?: number; data?: unknown }).data = details;
    throw error;
  }

  if (!parseJson) {
    // @ts-expect-error returning Response for callers that opt-out of JSON parsing
    return response;
  }

  return response.json() as Promise<T>;
}
