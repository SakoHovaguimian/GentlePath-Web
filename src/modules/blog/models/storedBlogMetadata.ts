import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

function isStoredValue(value: unknown, depth = 0): boolean {
  if (depth > 5) return false;
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.length <= 50000;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) {
    return (
      value.length <= 25000 &&
      value.every((item) => isStoredValue(item, depth + 1))
    );
  }
  if (
    !value ||
    typeof value !== 'object' ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return false;
  }
  const entries = Object.entries(value);
  return (
    entries.length <= 100 &&
    entries.every(
      ([key, item]) =>
        key.length > 0 && key.length <= 100 && isStoredValue(item, depth + 1),
    )
  );
}

export const StoredBlogMetadataSchema = z
  .record(z.string(), z.unknown())
  .superRefine((value, context) => {
    if (!isStoredValue(value)) {
      context.addIssue({ code: 'custom', message: copy.invalidStoredContent });
      return;
    }
    if (new TextEncoder().encode(JSON.stringify(value)).length > 250000) {
      context.addIssue({ code: 'custom', message: copy.invalidContentSize });
    }
  });
export type StoredBlogMetadata = z.infer<typeof StoredBlogMetadataSchema>;
