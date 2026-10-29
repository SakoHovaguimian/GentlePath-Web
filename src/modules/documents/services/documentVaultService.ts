import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import {
  CareDocumentSchema,
  DocumentMetadataInputSchema,
  type DocumentMetadataInput,
} from '../models/careDocument';
import {
  DocumentQuerySchema,
  type DocumentQuery,
} from '../models/documentQuery';
import { DocumentPageSchema } from '../models/documentPage';
import { DocumentDownloadSchema } from '../models/documentDownload';
import { validateDocumentFile } from './documentFileValidation';

const basePath = '/portal/documents';

export class DocumentVaultService {
  constructor(private readonly api: ApiClientInterface) {}

  async list(input: DocumentQuery, signal?: AbortSignal) {
    const query = validateInput(DocumentQuerySchema, input);
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.query) params.set('query', query.query);
    if (query.documentType) params.set('documentType', query.documentType);
    if (query.childId) params.set('childId', query.childId);
    if (query.personalOnly) params.set('personalOnly', 'true');
    return DocumentPageSchema.parse(
      await this.api.request(`${basePath}?${params}`, { signal }),
    );
  }

  async get(id: string, signal?: AbortSignal) {
    return CareDocumentSchema.parse(
      await this.api.request(`${basePath}/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }

  async upload(
    file: File,
    metadata: DocumentMetadataInput,
    uploadId: string,
    signal?: AbortSignal,
  ) {
    const input = validateInput(DocumentMetadataInputSchema, metadata);
    const mimeType = await validateDocumentFile(file);
    signal?.throwIfAborted();
    const form = new FormData();
    form.set('file', new File([file], file.name, { type: mimeType }));
    form.set('title', input.title);
    form.set('documentType', input.documentType);
    if (input.childId) form.set('childId', input.childId);
    return CareDocumentSchema.parse(
      await this.api.request(basePath, {
        method: 'POST',
        body: form,
        signal,
        headers: { 'idempotency-key': uploadId },
      }),
    );
  }

  async update(id: string, input: DocumentMetadataInput) {
    return CareDocumentSchema.parse(
      await this.api.request(`${basePath}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: validateInput(DocumentMetadataInputSchema, input),
      }),
    );
  }

  async remove(id: string) {
    await this.api.request(`${basePath}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async download(id: string, signal?: AbortSignal) {
    return DocumentDownloadSchema.parse(
      await this.api.request(`${basePath}/${encodeURIComponent(id)}/download`, {
        signal,
      }),
    );
  }
}
