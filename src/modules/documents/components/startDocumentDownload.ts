import { ValidationError } from '@/errors/domainErrors';
import { gentlePathDocumentStrings as copy } from '@/strings';
import type { DocumentDownload } from '../models/documentDownload';
import {
  detectDocumentMimeType,
  safeDocumentFileName,
} from '../services/documentFileValidation';

export function startDocumentDownload(download: DocumentDownload): void {
  const anchor = document.createElement('a');
  anchor.relList.add('noopener', 'noreferrer');
  let objectUrl: string | undefined;
  if ('url' in download) {
    anchor.href = download.url;
    // The backend signs an attachment disposition; credentials are never
    // supplied to storage. Cross-origin download attributes are advisory.
    anchor.referrerPolicy = 'no-referrer';
    anchor.download = '';
  } else {
    const bytes = Uint8Array.from(atob(download.contentBase64), (character) =>
      character.charCodeAt(0),
    );
    if (
      bytes.length !== download.sizeBytes ||
      detectDocumentMimeType(bytes) !== download.mimeType
    )
      throw new ValidationError(copy.validation.downloadDescription);
    objectUrl = URL.createObjectURL(
      new Blob([bytes], { type: download.mimeType }),
    );
    anchor.href = objectUrl;
    anchor.download = safeDocumentFileName(download.fileName);
  }
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  if (objectUrl) {
    const url = objectUrl;
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
