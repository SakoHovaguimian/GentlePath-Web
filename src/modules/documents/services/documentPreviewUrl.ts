export function documentPreviewUrl(id: string): string {
  return `/api/backend/portal/documents/${encodeURIComponent(id)}/preview`;
}
