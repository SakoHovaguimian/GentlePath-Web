import { ValidationError } from '@/errors/domainErrors';
import { gentlePathDocumentStrings as copy } from '@/strings';
import type { DocumentMimeType } from '../models/documentMimeType';

export const documentMaxSizeBytes = 10 * 1024 * 1024;
export const documentFileAccept =
  '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp';
const extensions: Record<DocumentMimeType, readonly string[]> = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};
const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.subarray(from, to));

export function validateDocumentFileSelection(file: File): void {
  if (file.size === 0 || file.size > documentMaxSizeBytes)
    throw new ValidationError(copy.validation.fileSizeDescription);
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (
    file.name.length > 300 ||
    !Object.values(extensions).some((values) =>
      values.includes(extension ?? ''),
    ) ||
    (file.type && !Object.hasOwn(extensions, file.type))
  )
    throw new ValidationError(copy.validation.fileTypeDescription);
}

// Signature checks run on both sides of the proxy. The live care-document
// service additionally parses image metadata and bounds decoded dimensions.
export function detectDocumentMimeType(bytes: Uint8Array): DocumentMimeType {
  if (bytes.length === 0 || bytes.length > documentMaxSizeBytes)
    throw new ValidationError(copy.validation.fileSizeDescription);
  if (
    ascii(bytes, 0, 5) === '%PDF-' &&
    ascii(bytes, Math.max(0, bytes.length - 1024), bytes.length).includes(
      '%%EOF',
    )
  )
    return 'application/pdf';
  if (
    bytes.length >= 12 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  )
    return 'image/jpeg';
  if (
    bytes.length >= 45 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    ) &&
    ascii(bytes, 12, 16) === 'IHDR' &&
    ascii(bytes, bytes.length - 8, bytes.length - 4) === 'IEND'
  )
    return 'image/png';
  if (
    bytes.length >= 20 &&
    ascii(bytes, 0, 4) === 'RIFF' &&
    ascii(bytes, 8, 12) === 'WEBP' &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(ascii(bytes, 12, 16))
  )
    return 'image/webp';
  throw new ValidationError(copy.validation.fileContentDescription);
}

export async function validateDocumentFile(
  file: File,
): Promise<DocumentMimeType> {
  validateDocumentFileSelection(file);
  const detected = detectDocumentMimeType(
    new Uint8Array(await file.arrayBuffer()),
  );
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (
    !extensions[detected].includes(extension) ||
    (file.type && file.type !== detected)
  )
    throw new ValidationError(copy.validation.fileContentDescription);
  return detected;
}

export function safeDocumentFileName(name: string): string {
  return (
    name
      .split(/[\\/]/)
      .pop()
      ?.replace(/[\u0000-\u001f\u007f]/g, '')
      .slice(0, 300) || copy.defaultFileName
  );
}
