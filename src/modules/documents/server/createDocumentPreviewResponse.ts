import 'server-only';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathDocumentStrings as copy } from '@/strings';
import type { CareDocument } from '../models/careDocument';
import {
  detectDocumentMimeType,
  safeDocumentFileName,
} from '../services/documentFileValidation';
import { documentRangeHeader } from './documentRangeHeader';

export function createDocumentPreviewResponse(
  request: Request,
  document: CareDocument,
  bytes: Uint8Array,
): Response {
  if (
    bytes.length !== document.sizeBytes ||
    detectDocumentMimeType(bytes) !== document.mimeType
  )
    throw new ValidationError(copy.validation.previewDescription);

  const fileName = safeDocumentFileName(document.fileName);
  const fallbackName = fileName.replace(/[^\x20-\x7e]|["\\]/g, '_');
  const encodedName = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  const headers = new Headers({
    'cache-control': 'private, no-store',
    'content-type': document.mimeType,
    'content-disposition': `inline; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`,
    'x-content-type-options': 'nosniff',
    'content-security-policy': "default-src 'none'; sandbox; base-uri 'none'",
    'cross-origin-resource-policy': 'same-origin',
    'referrer-policy': 'no-referrer',
    'accept-ranges': 'bytes',
  });

  // PDF readers may request a single range. Authorization and complete-file
  // validation still run for every request; private bytes are never cached.
  const range = request.headers.get('range');
  if (range && !request.headers.has('if-range')) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const suffix = match?.[1] === '';
    const start = suffix
      ? Math.max(0, bytes.length - Number(match?.[2]))
      : Number(match?.[1]);
    const end = suffix
      ? bytes.length - 1
      : Math.min(
          bytes.length - 1,
          match?.[2] ? Number(match[2]) : bytes.length - 1,
        );
    if (
      !match ||
      (!match[1] && !match[2]) ||
      (suffix && Number(match[2]) === 0) ||
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= bytes.length
    ) {
      headers.set('content-range', documentRangeHeader(bytes.length));
      return new Response(null, { status: 416, headers });
    }
    headers.set('content-range', documentRangeHeader(bytes.length, start, end));
    headers.set('content-length', String(end - start + 1));
    return new Response(Buffer.from(bytes.subarray(start, end + 1)), {
      status: 206,
      headers,
    });
  }

  headers.set('content-length', String(bytes.length));
  return new Response(Buffer.from(bytes), { headers });
}
