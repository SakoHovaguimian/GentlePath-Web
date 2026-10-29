import 'server-only';
import { environment } from '@/config/environment';
import { strings } from '@/strings';
import type { ApiRequestOptions } from './apiClientInterface';
import { parseApiResponse } from './response';
export class ApiClient {
  async request<T>(
    path: string,
    accessToken: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);
    const multipart = options.body instanceof FormData;
    if (options.body !== undefined && !multipart)
      headers.set('content-type', 'application/json');
    const response = await this.proxy(
      new Request('http://portal.internal', {
        method: options.method || 'GET',
        signal: options.signal,
        headers,
        body:
          options.body === undefined
            ? undefined
            : multipart
              ? (options.body as FormData)
              : JSON.stringify(options.body),
      }),
      path,
      accessToken,
    );
    return parseApiResponse<T>(response);
  }
  async proxy(
    request: Request,
    path: string,
    accessToken: string,
  ): Promise<Response> {
    if (
      !path.startsWith('/') ||
      path.startsWith('//') ||
      path.includes('\\') ||
      /(^|\/)\.\.(\/|$)/.test(path)
    )
      throw new Error(strings.errors.invalidPath);
    const headers = new Headers({
      'app-version': environment.appVersion,
      accept: 'application/json',
    });
    const authorizationHeader = 'authorization';
    const authorization = `Bearer ${accessToken}`;
    if (accessToken) headers.set(authorizationHeader, authorization);
    for (const name of ['content-type', 'idempotency-key']) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const response = await fetch(`${environment.apiUrl}${path}`, {
      method: request.method,
      headers,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
    });
    const responseHeaders = new Headers({ 'cache-control': 'no-store' });
    for (const name of ['content-type', 'content-disposition', 'retry-after']) {
      const value = response.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  }
}
