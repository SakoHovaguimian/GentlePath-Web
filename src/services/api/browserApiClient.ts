import { strings } from '@/strings';
import type {
  ApiClientInterface,
  ApiRequestOptions,
} from './apiClientInterface';
import { parseApiResponse } from './response';
export class BrowserApiClient implements ApiClientInterface {
  constructor(private readonly prefix = '/api/backend') {}
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
      throw new Error(strings.errors.invalidPath);
    const headers = new Headers(options.headers);
    headers.set('accept', 'application/json');
    if (options.body !== undefined)
      headers.set('content-type', 'application/json');
    const response = await fetch(`${this.prefix}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.replace(
        `/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    }
    return parseApiResponse<T>(response);
  }
}
