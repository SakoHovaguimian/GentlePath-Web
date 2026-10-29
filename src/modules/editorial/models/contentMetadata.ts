import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';

function validMetadata(value: unknown, depth = 0): boolean {
  if (depth > 5) return false;
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.length <= 10000;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value))
    return (
      value.length <= 100 &&
      value.every((item) => validMetadata(item, depth + 1))
    );
  if (
    !value ||
    typeof value !== 'object' ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const entries = Object.entries(value);
  return (
    entries.length <= 100 &&
    entries.every(
      ([key, item]) =>
        key.length > 0 && key.length <= 100 && validMetadata(item, depth + 1),
    )
  );
}

export const ContentMetadataSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (value) =>
      validMetadata(value) &&
      new TextEncoder().encode(JSON.stringify(value)).byteLength <= 20000,
    copy.validation.metadataDescription,
  );
export type ContentMetadata = z.infer<typeof ContentMetadataSchema>;
