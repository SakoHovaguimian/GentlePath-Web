import 'server-only';
import { z } from 'zod';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { DemoContext } from '@/models/demoContext';
import type { ServerSession } from '@/services/session/models/serverSession';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { gentlePathDocumentStrings as copy } from '@/strings';
import { DocumentQuerySchema } from '../models/documentQuery';
import { safeDocumentFileName } from '../services/documentFileValidation';
import {
  parseDocumentMetadataRequest,
  parseDocumentUploadRequest,
} from '../server/parseDocumentUploadRequest';
import { getDemoDocumentVaultState } from './documentVaultDemoState';

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });

export async function handleDocumentVaultRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, resource, id, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || resource !== 'documents') return null;
  const current = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.disabled &&
      !user.deleted,
  );
  if (!session.demo || !current) throw new AuthError();
  if (extra.length || (action && action !== 'download'))
    throw new NotFoundError();
  const state = getDemoDocumentVaultState();
  const ownChildren = getDemoPortalState().children.filter(
    (child) => child.userId === current.id,
  );
  const requireChild = (childId: string | null) => {
    if (childId && !ownChildren.some((child) => child.id === childId))
      throw new OwnershipError(copy.validation.invalidChildDescription);
  };
  const own = state.documents.filter(
    (document) =>
      document.metadata.userId === current.id &&
      (!document.metadata.childId ||
        ownChildren.some((child) => child.id === document.metadata.childId)),
  );
  const method = request.method;

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
    if (query.childId) requireChild(query.childId);
    const matches =
      context.scenario === 'empty'
        ? []
        : own
            .filter(
              ({ metadata: item }) =>
                (!query.documentType ||
                  item.documentType === query.documentType) &&
                (!query.childId || item.childId === query.childId) &&
                (!query.personalOnly || !item.childId) &&
                item.title
                  .toLocaleLowerCase('en-US')
                  .includes(query.query.toLocaleLowerCase('en-US')),
            )
            .sort(
              (a, b) =>
                b.metadata.createdAt.localeCompare(a.metadata.createdAt) ||
                b.metadata.id.localeCompare(a.metadata.id),
            );
    const data = matches
      .slice(query.offset, query.offset + query.limit)
      .map((item) => item.metadata);
    const hasMore = query.offset + data.length < matches.length;
    return json({
      data,
      page: {
        limit: query.limit,
        offset: query.offset,
        hasMore,
        nextOffset: hasMore ? query.offset + query.limit : null,
      },
    });
  }
  if (!id && method === 'POST') {
    const { file, metadata, mimeType } =
      await parseDocumentUploadRequest(request);
    requireChild(metadata.childId);
    const key = request.headers.get('idempotency-key');
    if (key && !z.uuid().safeParse(key).success) throw new ValidationError();
    const uploadKey = key ? `${current.id}:${key}` : null;
    const existing = uploadKey
      ? own.find((item) => item.metadata.id === state.uploads.get(uploadKey))
      : null;
    if (existing) return json(existing.metadata, 201);
    const now = new Date().toISOString();
    const document = {
      metadata: {
        id: crypto.randomUUID(),
        userId: current.id,
        ...metadata,
        fileName: safeDocumentFileName(file.name),
        mimeType,
        sizeBytes: file.size,
        createdAt: now,
        updatedAt: now,
      },
      contentBase64: Buffer.from(await file.arrayBuffer()).toString('base64'),
    };
    state.documents.unshift(document);
    if (uploadKey) state.uploads.set(uploadKey, document.metadata.id);
    return json(document.metadata, 201);
  }
  if (!id) throw new NotFoundError();
  const document = own.find((item) => item.metadata.id === id);
  // Missing and inaccessible records deliberately have the same response.
  if (!document)
    throw new NotFoundError(copy.validation.unavailableDescription);
  if (action === 'download' && method === 'GET')
    return json({
      fileName: document.metadata.fileName,
      mimeType: document.metadata.mimeType,
      sizeBytes: document.metadata.sizeBytes,
      contentBase64: document.contentBase64,
    });
  if (!action && method === 'GET') return json(document.metadata);
  if (!action && method === 'PATCH') {
    const metadata = await parseDocumentMetadataRequest(request);
    requireChild(metadata.childId);
    document.metadata = {
      ...document.metadata,
      ...metadata,
      updatedAt: new Date().toISOString(),
    };
    return json(document.metadata);
  }
  if (!action && method === 'DELETE') {
    state.documents = state.documents.filter((item) => item.metadata.id !== id);
    for (const [key, value] of state.uploads)
      if (value === id) state.uploads.delete(key);
    return new Response(null, {
      status: 204,
      headers: { 'cache-control': 'no-store' },
    });
  }
  throw new NotFoundError();
}
