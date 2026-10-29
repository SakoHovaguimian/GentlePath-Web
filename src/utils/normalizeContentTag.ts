/** Capitalize tag words while preserving acronyms and existing mixed-case names. */
export function normalizeContentTag(value: string): string {
  return value
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, (word) => {
      if (/\p{Lu}/u.test(word)) return word;
      const [first, ...rest] = Array.from(word);
      return first!.toLocaleUpperCase('en-US') + rest.join('');
    });
}

/** Upgrade retained fixture records without exposing duplicate case variants. */
export function normalizeContentTags(values: readonly string[]): string[] {
  const tags = new Map<string, string>();
  for (const value of values) {
    const tag = normalizeContentTag(value);
    if (tag && !tags.has(tag.toLocaleLowerCase('en-US')))
      tags.set(tag.toLocaleLowerCase('en-US'), tag);
  }
  return [...tags.values()];
}
