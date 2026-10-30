import { documentPreviewUrl } from '../services/documentPreviewUrl';

export function startDocumentPreview(id: string): void {
  window.open(documentPreviewUrl(id), '_blank', 'noopener,noreferrer');
}
