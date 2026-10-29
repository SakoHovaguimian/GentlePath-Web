import 'server-only';
import { NotFoundError, ValidationError } from '@/errors/domainErrors';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

import type { DemoBlogImage } from './models/demoBlogImage';
import { validateBlogImageUpload } from '@/modules/blog/server/validateBlogImageUpload';

const demoGlobal = globalThis as typeof globalThis & {
  gentlePathDemoBlogImages?: Map<string, DemoBlogImage>;
};
const images = () => (demoGlobal.gentlePathDemoBlogImages ??= new Map());
export async function uploadDemoBlogImage(request: Request): Promise<Response> {
  const file = await validateBlogImageUpload(request);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const storedBytes = [...images().values()].reduce(
    (size, image) => size + image.bytes.byteLength,
    0,
  );
  if (images().size >= 20 || storedBytes + bytes.length > 25 * 1024 * 1024)
    throw new ValidationError(copy.uploadCapacityError);
  const id = crypto.randomUUID();
  images().set(id, { bytes, type: file.type });
  return Response.json(
    {
      fileName: id,
      thumbnailFileName: null,
      visibility: 'public',
      url: `/api/public/blog-media/${id}`,
      thumbnailUrl: null,
    },
    { status: 201, headers: { 'cache-control': 'no-store' } },
  );
}
export function readDemoBlogImage(id: string): Response {
  if (!/^[0-9a-f-]{36}$/.test(id))
    throw new NotFoundError(copy.uploadInvalidError);
  const image = images().get(id);
  if (!image) throw new NotFoundError(copy.uploadInvalidError);
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
export function resetDemoBlogImages(): void {
  demoGlobal.gentlePathDemoBlogImages = new Map();
}
