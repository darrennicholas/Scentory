const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const apiOrigin = new URL(baseUrl).origin;

export function resolveImageUrl(src?: string | null): string | null {
  if (!src) return null;
  return src.startsWith('/storage/images/') ? new URL(src, apiOrigin).toString() : src;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errors = body?.error?.fieldErrors as Record<string,string[]> | undefined;
    const detail = errors ? Object.entries(errors).flatMap(([field, messages]) => messages.map(message => `${field}: ${message}`)).join('; ') : '';
    throw new ApiError(response.status, body?.error?.code || 'REQUEST_FAILED', detail || body?.error?.message || 'Request failed', errors);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  for (;;) {
    const separator = path.includes('?') ? '&' : '?';
    const result = await apiRequest<{data:T[];meta:{totalPages:number}}>(`${path}${separator}limit=100&page=${page}`);
    items.push(...result.data);
    if (page >= result.meta.totalPages) return items;
    page++;
  }
}

