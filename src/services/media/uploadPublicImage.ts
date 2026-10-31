import { ValidationError } from '@/errors/domainErrors';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { strings } from '@/strings';
import {
  publicImageMaxBytes,
  publicImageMimeTypes,
  PublicImageSchema,
} from './models/publicImage';
export async function uploadPublicImage(
  api: ApiClientInterface,
  file: File,
  path: string,
  signal?: AbortSignal,
) {
  if (!publicImageMimeTypes.some((type) => type === file.type))
    throw new ValidationError(strings.media.imageTypeError);
  if (!file.size || file.size > publicImageMaxBytes)
    throw new ValidationError(strings.media.imageSizeError);
  const body = new FormData();
  body.set('file', file);
  body.set('mediaType', 'IMAGE');
  body.set('visibility', 'public');
  return PublicImageSchema.parse(
    await api.request(path, { method: 'POST', body, signal }),
  );
}
