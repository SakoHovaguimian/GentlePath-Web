import 'server-only';
import { NotFoundError, ValidationError } from '@/errors/domainErrors';
import { strings } from '@/strings';

import type { DemoPublicImage } from './models/demoPublicImage';
import { validatePublicImageUpload } from '@/services/media/server/validatePublicImageUpload';

const demoGlobal = globalThis as typeof globalThis & {
  gentlePathDemoBlogImages?: Map<string, DemoPublicImage>;
};
const images = () => (demoGlobal.gentlePathDemoBlogImages ??= new Map());
export async function uploadDemoPublicImage(
  request: Request,
  kind: 'blog' | 'content' = 'blog',
): Promise<Response> {
  const file = await validatePublicImageUpload(request);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const storedBytes = [...images().values()].reduce(
    (size, image) => size + image.bytes.byteLength,
    0,
  );
  if (images().size >= 20 || storedBytes + bytes.length > 25 * 1024 * 1024)
    throw new ValidationError(strings.media.imageCapacityError);
  const id = crypto.randomUUID();
  images().set(id, { bytes, type: file.type });
  return Response.json(
    {
      fileName: id,
      thumbnailFileName: null,
      visibility: 'public',
      url: `/api/public/${kind}-media/${id}`,
      thumbnailUrl: null,
    },
    { status: 201, headers: { 'cache-control': 'no-store' } },
  );
}
export function readDemoPublicImage(id: string): Response {
  if (!/^[0-9a-f-]{36}$/.test(id))
    throw new NotFoundError(strings.media.previewUnavailable);
  const image = images().get(id);
  if (!image) throw new NotFoundError(strings.media.previewUnavailable);
  return new Response(Buffer.from(image.bytes), {
    headers: {
      'content-type': image.type,
      'content-length': String(image.bytes.length),
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; sandbox",
    },
  });
}
export function resetDemoPublicImages(): void {
  demoGlobal.gentlePathDemoBlogImages = new Map();
}
