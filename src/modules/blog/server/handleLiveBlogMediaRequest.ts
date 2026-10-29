import 'server-only';
import type { BackendForward } from '@/services/api/models/backendForward';
import { validateBlogImageUpload } from './validateBlogImageUpload';

export async function handleLiveBlogMediaRequest(
  request: Request,
  path: string,
  forward: BackendForward,
): Promise<Response | null> {
  if (
    new URL(path, 'http://portal.internal').pathname !== '/blog/media/upload' ||
    request.method !== 'POST'
  )
    return null;
  const file = await validateBlogImageUpload(request.clone());
  const body = new FormData();
  body.set('file', file);
  body.set('mediaType', 'IMAGE');
  body.set('visibility', 'public');
  const headers = new Headers(request.headers);
  headers.delete('content-type');
  headers.delete('content-length');
  return forward(
    new Request(request.url, {
      method: 'POST',
      headers,
      body,
      signal: request.signal,
    }),
    '/media/upload-media',
  );
}
