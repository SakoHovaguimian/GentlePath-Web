import 'server-only';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathDocumentStrings as copy } from '@/strings';
import { DocumentMetadataInputSchema } from '../models/careDocument';
import {
  documentMaxSizeBytes,
  validateDocumentFile,
} from '../services/documentFileValidation';

// Bound the complete multipart envelope before its parser buffers a file. This
// also enforces the limit when Content-Length is absent or untrusted.
export async function readBoundedDocumentRequest(
  request: Request,
  maximum: number,
): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(request.headers.get('content-length') ?? 0) > maximum)
    throw new ValidationError(copy.validation.tooLargeDescription);
  const reader = request.body?.getReader();
  if (!reader)
    throw new ValidationError(copy.validation.fileRequiredDescription);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) {
        await reader.cancel();
        throw new ValidationError(copy.validation.tooLargeDescription);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

export async function parseDocumentUploadRequest(request: Request) {
  const body = await readBoundedDocumentRequest(
    request,
    documentMaxSizeBytes + 32768,
  );
  const form = await new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body,
  })
    .formData()
    .catch(() => {
      throw new ValidationError(copy.validation.invalidMetadataDescription);
    });
  const allowed = new Set(['file', 'title', 'documentType', 'childId']);
  for (const key of form.keys()) {
    if (!allowed.has(key) || form.getAll(key).length !== 1)
      throw new ValidationError(copy.validation.invalidMetadataDescription);
  }
  const file = form.get('file');
  if (!(file instanceof File))
    throw new ValidationError(copy.validation.fileRequiredDescription);
  const metadata = DocumentMetadataInputSchema.parse({
    title: form.get('title'),
    documentType: form.get('documentType'),
    childId: form.get('childId') || null,
  });
  const mimeType = await validateDocumentFile(file);
  return { file, metadata, mimeType };
}

export async function parseDocumentMetadataRequest(request: Request) {
  const body = await readBoundedDocumentRequest(request, 8192);
  let input: unknown;
  try {
    input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
  } catch {
    throw new ValidationError(copy.validation.invalidMetadataDescription);
  }
  return DocumentMetadataInputSchema.parse(input);
}
