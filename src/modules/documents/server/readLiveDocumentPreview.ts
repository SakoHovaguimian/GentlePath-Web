import 'server-only';
import { ApiError, ValidationError } from '@/errors/domainErrors';
import { gentlePathDocumentStrings as copy } from '@/strings';
import type { DocumentTransport } from '../models/documentTransport';
import { documentMaxSizeBytes } from '../services/documentFileValidation';

export async function readLiveDocumentPreview(
  request: Request,
  document: DocumentTransport,
  signedUrl: string,
): Promise<Uint8Array> {
  const url = new URL(signedUrl);
  // Only the canonical backend's AWS S3 presigned object URL is accepted.
  // Browser input never supplies a fetch URL, host, storage key, or headers.
  const s3Host =
    /^(?:[a-z0-9][a-z0-9.-]*\.)?s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com(?:\.cn)?$/;
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    !s3Host.test(url.hostname) ||
    !decodeURIComponent(url.pathname).endsWith(
      `/Media/${document.file_name}`,
    ) ||
    url.searchParams.get('X-Amz-Algorithm') !== 'AWS4-HMAC-SHA256' ||
    !/^[a-f0-9]{64}$/.test(url.searchParams.get('X-Amz-Signature') ?? '') ||
    document.size_bytes > documentMaxSizeBytes
  )
    throw new ValidationError(copy.validation.previewDescription);

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'error',
    referrerPolicy: 'no-referrer',
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
  });
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new ApiError(copy.validation.previewDescription, 502);
  }
  const length = response.headers.get('content-length');
  if (length && Number(length) !== document.size_bytes) {
    await response.body.cancel();
    throw new ValidationError(copy.validation.previewDescription);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > document.size_bytes || size > documentMaxSizeBytes)
        throw new ValidationError(copy.validation.previewDescription);
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  if (size !== document.size_bytes)
    throw new ValidationError(copy.validation.previewDescription);
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
