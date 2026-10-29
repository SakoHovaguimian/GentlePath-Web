import 'server-only';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { blogImageMaxBytes, blogImageMimeTypes } from '../models/blogMedia';

export async function validateBlogImageUpload(request: Request): Promise<File> {
  const length = Number(request.headers.get('content-length'));
  if (length > blogImageMaxBytes + 65536)
    throw new ValidationError(copy.uploadSizeError);
  const data = await request.formData().catch(() => {
    throw new ValidationError(copy.uploadMissingError);
  });
  const file = data.get('file');
  if (!(file instanceof File))
    throw new ValidationError(copy.uploadMissingError);
  if (!blogImageMimeTypes.some((type) => type === file.type))
    throw new ValidationError(copy.uploadTypeError);
  if (!file.size || file.size > blogImageMaxBytes)
    throw new ValidationError(copy.uploadSizeError);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signatures: Record<string, () => boolean> = {
    'image/png': () =>
      [137, 80, 78, 71, 13, 10, 26, 10].every(
        (value, index) => bytes[index] === value,
      ),
    'image/jpeg': () =>
      bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    'image/gif': () =>
      /^GIF8[79]a$/.test(Buffer.from(bytes.subarray(0, 6)).toString('ascii')),
    'image/webp': () =>
      Buffer.from(bytes.subarray(0, 4)).toString('ascii') === 'RIFF' &&
      Buffer.from(bytes.subarray(8, 12)).toString('ascii') === 'WEBP',
  };
  if (!signatures[file.type]?.())
    throw new ValidationError(copy.uploadInvalidError);
  return file;
}
