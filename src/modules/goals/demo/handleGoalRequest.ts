import 'server-only';
import { GoalStatusInputSchema } from '../models/goalStatusInput';
import { z } from 'zod';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import { gentlePathGoalStrings as copy } from '@/strings';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { GoalInputSchema, type Goal } from '../models/goal';
import { GoalQuerySchema } from '../models/goalQuery';
import { GoalNoteInputSchema } from '../models/goalNote';
import { GoalUploadInputSchema } from '../models/goalUploadInput';

import { getDemoGoalState } from './goalDemoState';
import { validateGoalUploadBytes } from '../server/validateGoalUploadBytes';
import { goalBytesResponse } from '../server/goalBytesResponse';
import { readBoundedDocumentRequest } from '@/modules/documents/server/parseDocumentUploadRequest';

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
const successReceipt = 'success!';

export async function handleGoalRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] !== 'portal' || parts[1] !== 'goals') return null;
  const current = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!session.demo || !current) throw new AuthError();
  const [, , id, action, subId, subAction, ...extra] = parts;
  if (extra.length) throw new NotFoundError();
  const state = getDemoGoalState();
  const children = getDemoPortalState().children.filter(
    (child) => child.userId === current.id,
  );
  const requireChild = (childId: string) => {
    if (!children.some((child) => child.id === childId))
      throw new OwnershipError(copy.invalidGoal);
  };
  // Deletion removes all private bytes even when a retained goal becomes invisible.
  for (const [key, upload] of state.uploads) {
    const owner = getDemoState().users.find(
      (user) => user.id === upload.userId && !user.deleted,
    );
    const child = getDemoPortalState().children.find(
      (child) =>
        child.id === upload.input.child_id && child.userId === upload.userId,
    );
    if (!owner || !child || upload.cancelled || upload.retainUntil < Date.now())
      state.uploads.delete(key);
  }
  const own = state.goals.filter(
    (goal) =>
      goal.user_id === current.id &&
      !goal.deleted &&
      children.some((child) => child.id === goal.child_id),
  );
  const method = request.method;
  if (id === 'uploads') {
    if (!action && !subId && method === 'POST') {
      const input = GoalUploadInputSchema.parse(await request.json());
      requireChild(input.child_id);
      if (
        [...state.uploads.values()].filter(
          (upload) => upload.userId === current.id && !upload.media?.goal_id,
        ).length >= 30
      )
        throw new ValidationError(copy.attachmentLimit);
      const total = [...state.uploads.values()].reduce(
        (sum, upload) => sum + upload.input.size_bytes,
        0,
      );
      if (total + input.size_bytes > 250 * 1024 * 1024)
        throw new ValidationError(copy.invalidFile);
      const uploadId = crypto.randomUUID();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      state.uploads.set(uploadId, {
        id: uploadId,
        userId: current.id,
        input,
        expiresAt,
        retainUntil: Date.now() + 24 * 60 * 60 * 1000,
      });
      return json(
        {
          id: uploadId,
          url: `/api/backend/portal/goals/uploads/${uploadId}/bytes`,
          fields: {},
          expires_at: new Date(expiresAt).toISOString(),
        },
        201,
      );
    }
    if (!action || !z.uuid().safeParse(action).success || subAction)
      throw new NotFoundError();
    const upload = state.uploads.get(action);
    if (!upload || upload.userId !== current.id) throw new NotFoundError();
    requireChild(upload.input.child_id);
    if (!subId && method === 'DELETE') {
      if (upload.media?.goal_id)
        throw new ValidationError(copy.invalidAttachment);
      state.uploads.delete(action);
      return json({ message: successReceipt });
    }
    if (subId === 'bytes' && method === 'POST') {
      if (upload.expiresAt < Date.now() || upload.media)
        throw new ValidationError(copy.draftExpired);
      const contentLength = Number(request.headers.get('content-length') ?? 0);
      if (contentLength > upload.input.size_bytes + 65536)
        throw new ValidationError(copy.invalidFile);
      const bounded = await readBoundedDocumentRequest(
        request,
        upload.input.size_bytes + 65536,
      );
      const form = await new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: bounded,
      }).formData();
      if (
        [...form.keys()].some((key) => key !== 'file') ||
        form.getAll('file').length !== 1
      )
        throw new ValidationError(copy.invalidFile);
      const file = form.get('file');
      if (
        !(file instanceof File) ||
        file.size !== upload.input.size_bytes ||
        file.type !== upload.input.mime_type
      )
        throw new ValidationError(copy.invalidFile);
      const bytes = Buffer.from(await file.arrayBuffer());
      validateGoalUploadBytes(bytes, upload.input);
      // Recheck ownership after reading asynchronously; a cancelled upload cannot resurrect bytes.
      requireChild(upload.input.child_id);
      if (state.uploads.get(action) !== upload) throw new NotFoundError();
      upload.bytes = bytes;
      return new Response(null, {
        status: 204,
        headers: { 'cache-control': 'no-store' },
      });
    }
    if (subId === 'complete' && method === 'POST') {
      if (upload.media) return json(upload.media);
      if (upload.expiresAt < Date.now() || !upload.bytes)
        throw new ValidationError(copy.draftExpired);
      validateGoalUploadBytes(upload.bytes, upload.input);
      upload.media = {
        id: action,
        goal_id: null,
        user_id: current.id,
        child_id: upload.input.child_id,
        upload_session_id: action,
        original_file_name: upload.input.original_file_name,
        mime_type: upload.input.mime_type,
        size_bytes: upload.input.size_bytes,
        position: 0,
        created_at: new Date().toISOString(),
      };
      return json(upload.media);
    }
    throw new NotFoundError();
  }
  if (!id && method === 'GET') {
    const query = GoalQuerySchema.parse(Object.fromEntries(url.searchParams));
    if (query.child_id) requireChild(query.child_id);
    const matches =
      context.scenario === 'empty'
        ? []
        : own
            .filter(
              (goal) =>
                (!query.child_id || goal.child_id === query.child_id) &&
                (!query.status || goal.status === query.status) &&
                `${goal.title} ${goal.description}`
                  .toLocaleLowerCase('en-US')
                  .includes(query.query.toLocaleLowerCase('en-US')),
            )
            .sort(
              (a, b) =>
                (b.created_at ?? '').localeCompare(a.created_at ?? '') ||
                b.id.localeCompare(a.id),
            );
    const data = matches.slice(query.offset, query.offset + query.limit);
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
  const goal = id ? own.find((item) => item.id === id) : undefined;
  if (id && !goal) throw new NotFoundError(copy.notFound);
  if ((!id && method === 'POST') || (goal && !action && method === 'PUT')) {
    const input = GoalInputSchema.parse(await request.json());
    requireChild(input.child_id);
    const media = input.media_ids.map(
      (mediaId) => state.uploads.get(mediaId)?.media,
    );
    if (
      media.some(
        (item) =>
          !item ||
          item.user_id !== current.id ||
          item.child_id !== input.child_id ||
          (item.goal_id && item.goal_id !== goal?.id),
      )
    )
      throw new ValidationError(copy.invalidAttachment);
    const cover = media.find((item) => item?.id === input.cover_media_id);
    if (input.cover_media_id && !cover?.mime_type.startsWith('image/'))
      throw new ValidationError(copy.invalidAttachment);
    const now = new Date().toISOString();
    const goalId = goal?.id ?? crypto.randomUUID();
    const updated: Goal = {
      id: goalId,
      user_id: current.id,
      child_id: input.child_id,
      title: input.title,
      description: input.description,
      status: input.status,
      cover_media_id: input.cover_media_id,
      completed_at:
        input.status === 'COMPLETED'
          ? (goal?.completed_at ?? now)
          : input.status === 'ACTIVE'
            ? null
            : (goal?.completed_at ?? null),
      created_at: goal?.created_at ?? now,
      updated_at: now,
      deleted: false,
      media: media.map((item, position) => ({
        ...item!,
        goal_id: goalId,
        position,
      })),
      notes: goal?.notes ?? [],
    };
    for (const old of goal?.media ?? [])
      if (!input.media_ids.includes(old.id))
        state.uploads.delete(old.upload_session_id);
    for (const item of updated.media) {
      const upload = state.uploads.get(item.upload_session_id)!;
      upload.media = item;
      upload.retainUntil = Number.MAX_SAFE_INTEGER;
    }
    if (goal) Object.assign(goal, updated);
    else state.goals.unshift(updated);
    return json(updated, goal ? 200 : 201);
  }
  if (!goal) throw new NotFoundError();
  if (!action && method === 'GET') return json(goal);
  if (!action && method === 'DELETE') {
    goal.deleted = true;
    for (const media of goal.media)
      state.uploads.delete(media.upload_session_id);
    goal.media = [];
    goal.cover_media_id = null;
    return json({ message: successReceipt });
  }
  if (action === 'status' && !subId && method === 'PATCH') {
    const { status } = GoalStatusInputSchema.parse(await request.json());
    goal.status = status;
    goal.completed_at =
      status === 'COMPLETED'
        ? (goal.completed_at ?? new Date().toISOString())
        : status === 'ACTIVE'
          ? null
          : goal.completed_at;
    goal.updated_at = new Date().toISOString();
    return json(goal);
  }
  if (action === 'notes' && !subAction) {
    const note = subId
      ? goal.notes.find((item) => item.id === subId)
      : undefined;
    if (subId && !note) throw new NotFoundError();
    if ((!subId && method === 'POST') || (note && method === 'PUT')) {
      const input = GoalNoteInputSchema.parse(await request.json());
      const now = new Date().toISOString();
      const updated = {
        ...input,
        id: note?.id ?? crypto.randomUUID(),
        goal_id: goal.id,
        created_at: note?.created_at ?? now,
        updated_at: now,
      };
      if (note) Object.assign(note, updated);
      else goal.notes.unshift(updated);
      goal.notes.sort(
        (a, b) =>
          b.occurred_at.localeCompare(a.occurred_at) ||
          b.id.localeCompare(a.id),
      );
      return json(updated, note ? 200 : 201);
    }
    if (note && method === 'DELETE') {
      goal.notes = goal.notes.filter((item) => item.id !== note.id);
      return json({ message: successReceipt });
    }
  }
  if (
    action === 'media' &&
    subId &&
    ['download', 'bytes'].includes(subAction) &&
    method === 'GET'
  ) {
    const media = goal.media.find((item) => item.id === subId);
    const upload = media
      ? state.uploads.get(media.upload_session_id)
      : undefined;
    if (!media || !upload?.bytes) throw new NotFoundError();
    const download = url.searchParams.get('download') ?? 'true';
    if (!['true', 'false'].includes(download)) throw new ValidationError();
    if (subAction === 'download')
      return json({
        url: `/api/backend/portal/goals/${goal.id}/media/${media.id}/bytes?download=${download}`,
      });
    return goalBytesResponse(request, media, upload.bytes, download === 'true');
  }
  throw new NotFoundError();
}
