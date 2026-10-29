import { strings } from '@/strings';
import type {
  ApiClientInterface,
  ApiRequestOptions,
} from './apiClientInterface';
import { parseApiResponse } from './response';
import type { BrowserApiClientOptions } from './models/browserApiClientOptions';
export class BrowserApiClient implements ApiClientInterface {
  constructor(
    private readonly prefix = '/api/backend',
    private readonly options: BrowserApiClientOptions = {},
  ) {}
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
      throw new Error(strings.errors.invalidPath);
    const headers = new Headers(options.headers);
    headers.set('accept', 'application/json');
    const multipart = options.body instanceof FormData;
    if (options.body !== undefined && !multipart)
      headers.set('content-type', 'application/json');
    const response = await fetch(`${this.prefix}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined
          ? undefined
          : multipart
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (
      response.status === 401 &&
      this.options.redirectOnUnauthorized !== false &&
      typeof window !== 'undefined'
    ) {
      window.location.replace(
        `/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    }
    return parseApiResponse<T>(response);
  }
}
