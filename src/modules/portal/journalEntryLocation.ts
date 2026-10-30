export function journalEntryCardId(id: string) {
  return `journal-entry-${id}`;
}

export function journalEntryLocation(id: string) {
  const query = new URLSearchParams({ focus: id });
  return `/journal?${query}`;
}
