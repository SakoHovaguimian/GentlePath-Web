import 'server-only';
import { NotFoundError, ValidationError } from '@/errors/domainErrors';
import { gentlePathDocumentStrings as copy } from '@/strings';
import { CareDocumentSchema } from '../models/careDocument';
import { DocumentDownloadSchema } from '../models/documentDownload';
import { DocumentQuerySchema } from '../models/documentQuery';
import {
  DocumentTransportSchema,
  type DocumentTransport,
} from '../models/documentTransport';
import { DocumentTransportPageSchema } from '../models/documentTransportPage';
import { safeDocumentFileName } from '../services/documentFileValidation';
import {
  parseDocumentMetadataRequest,
  parseDocumentUploadRequest,
} from './parseDocumentUploadRequest';

const fileExtensions = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

function mapDocument(value: DocumentTransport) {
  return CareDocumentSchema.parse({
    id: value.id,
    userId: value.user_id,
    childId: value.child_id,
    title: value.title,
    documentType: value.document_type,
    // The backend stores an opaque private object key, not the source filename.
    // Keep that key server-only and derive a useful display name from the title.
    fileName: safeDocumentFileName(
      `${value.title.slice(0, 280)}.${fileExtensions[value.mime_type]}`,
    ),
    mimeType: value.mime_type,
    sizeBytes: value.size_bytes,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  });
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export async function handleLiveDocumentVaultRequest(
  request: Request,
  path: string,
  forward: (request: Request, path: string) => Promise<Response>,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, resource, id, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || resource !== 'documents') return null;
  if (extra.length || (action && action !== 'download'))
    throw new NotFoundError();
  const method = request.method;
  const upstreamPath = `/care-documents${id ? `/${encodeURIComponent(id)}` : ''}`;

  if (!id && method === 'GET') {
    const personalOnly = url.searchParams.get('personalOnly');
    if (personalOnly && !['true', 'false'].includes(personalOnly))
      throw new ValidationError();
    const query = DocumentQuerySchema.parse({
      query: url.searchParams.get('query') ?? '',
      documentType: url.searchParams.get('documentType') ?? undefined,
      childId: url.searchParams.get('childId') ?? undefined,
      personalOnly: personalOnly === 'true',
      limit: url.searchParams.get('limit') ?? 9,
      offset: url.searchParams.get('offset') ?? 0,
    });
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.query) params.set('query', query.query);
    if (query.documentType) params.set('document_type', query.documentType);
    if (query.childId) params.set('child_id', query.childId);
    if (query.personalOnly) params.set('personal_only', 'true');
    const response = await forward(request, `${upstreamPath}?${params}`);
    if (!response.ok) return response;
    const result = DocumentTransportPageSchema.parse(await response.json());
    return json({ data: result.data.map(mapDocument), page: result.page });
  }
  if (!id && method === 'POST') {
    const { file, metadata, mimeType } =
      await parseDocumentUploadRequest(request);
    const form = new FormData();
    form.set(
      'file',
      new File([file], safeDocumentFileName(file.name), { type: mimeType }),
    );
    form.set('title', metadata.title);
    form.set('document_type', metadata.documentType);
    if (metadata.childId) form.set('child_id', metadata.childId);
    const headers = new Headers();
    const key = request.headers.get('idempotency-key');
    if (key) headers.set('idempotency-key', key);
    const response = await forward(
      new Request(request.url, {
        method: 'POST',
        headers,
        body: form,
      }),
      upstreamPath,
    );
    if (!response.ok) return response;
    return json(
      mapDocument(DocumentTransportSchema.parse(await response.json())),
      201,
    );
  }
  if (id && action === 'download' && method === 'GET') {
    const response = await forward(request, `${upstreamPath}/download`);
    if (!response.ok) return response;
    const result = DocumentDownloadSchema.parse(await response.json());
    if (!('url' in result))
      throw new ValidationError(copy.validation.downloadDescription);
    return json(result);
  }
  if (id && !action && method === 'GET') {
    const response = await forward(request, upstreamPath);
    if (!response.ok) return response;
    return json(
      mapDocument(DocumentTransportSchema.parse(await response.json())),
    );
  }
  if (id && !action && method === 'PATCH') {
    const input = await parseDocumentMetadataRequest(request);
    const response = await forward(
      new Request(request.url, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: input.title,
          document_type: input.documentType,
          child_id: input.childId,
        }),
      }),
      upstreamPath,
    );
    if (!response.ok) return response;
    return json(
      mapDocument(DocumentTransportSchema.parse(await response.json())),
    );
  }
  if (id && !action && method === 'DELETE') {
    const response = await forward(request, upstreamPath);
    if (!response.ok) return response;
    return new Response(null, {
      status: 204,
      headers: { 'cache-control': 'no-store' },
    });
  }
  throw new NotFoundError();
}
