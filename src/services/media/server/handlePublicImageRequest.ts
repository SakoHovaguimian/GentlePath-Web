import 'server-only';
import type { BackendForward } from '@/services/api/models/backendForward';
import { uploadDemoPublicImage } from '@/services/demo/demoPublicImages';
import { validatePublicImageUpload } from './validatePublicImageUpload';
export async function handlePublicImageRequest(
  request: Request,
  path: string,
  forward?: BackendForward,
): Promise<Response | null> {
  if (
    new URL(path, 'http://gentlepath.internal').pathname !==
      '/admin/media/images' ||
    request.method !== 'POST'
  )
    return null;
  if (!forward) return uploadDemoPublicImage(request, 'content');
  const file = await validatePublicImageUpload(request.clone());
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
