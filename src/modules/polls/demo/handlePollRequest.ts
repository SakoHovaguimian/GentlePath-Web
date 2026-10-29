import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { DemoContext } from '@/models/demoContext';
import type { ServerSession } from '@/services/session/models/serverSession';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import {
  gentlePathPollStrings as copy,
  gentlePathDemoStrings as demoCopy,
} from '@/strings';
import { PollInputSchema, type Poll } from '../models/poll';
import { PollBallotInputSchema } from '../models/pollBallot';
import {
  PollCommentInputSchema,
  type PollComment,
} from '../models/pollComment';
import { PollReactionInputSchema } from '../models/pollReaction';
import { PollPagingSchema, PollQuerySchema } from '../models/pollQuery';
import type { DemoPoll } from './models/demoPoll';
import type { DemoPollComment } from './models/demoPollComment';
import { getDemoPollState } from './pollState';

export { resetDemoPollState } from './pollState';
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
const readInput = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
const newest = <T extends { createdAt: string; id: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

export async function handlePollRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, id, action, detail, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'polls') return null;
  if (extra.length) throw new NotFoundError();
  const accounts = getDemoState();
  const current = accounts.users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!session.demo || !current) throw new AuthError();
  const portal = getDemoPortalState();
  if (portal.settings.maintenanceMode && (current.role ?? 'user') === 'user')
    throw new ApiError(demoCopy.maintenanceActive, 503);
  if (request.method !== 'GET' && !portal.settings.communityEnabled)
    throw new OwnershipError(demoCopy.communityPaused);
  const state = getDemoPollState();
  const method = request.method;
  const activeUser = (userId: string) =>
    accounts.users.find(
      (user) => user.id === userId && !user.deleted && !user.disabled,
    );
  const author = (userId: string) => {
    const user = activeUser(userId);
    return user
      ? { id: user.id, firstName: user.first_name, lastName: user.last_name }
      : null;
  };
  const visiblePoll = (poll: DemoPoll) =>
    !poll.deleted && !poll.hidden && Boolean(activeUser(poll.userId));
  const visibleComment = (comment: DemoPollComment) =>
    !comment.deleted &&
    !comment.hidden &&
    Boolean(activeUser(comment.userId)) &&
    state.polls.some((poll) => poll.id === comment.pollId && visiblePoll(poll));
  const requirePoll = (pollId: string, includeHidden = false) => {
    z.string().uuid().parse(pollId);
    const poll = state.polls.find(
      (poll) => poll.id === pollId && (includeHidden || visiblePoll(poll)),
    );
    if (!poll) throw new NotFoundError(copy.validation.unavailableDescription);
    return poll;
  };
  const requireComment = (commentId: string, includeHidden = false) => {
    z.string().uuid().parse(commentId);
    const comment = state.comments.find(
      (comment) =>
        comment.id === commentId && (includeHidden || visibleComment(comment)),
    );
    if (!comment) throw new NotFoundError();
    return comment;
  };
  const commentData = (comment: DemoPollComment): PollComment => ({
    id: comment.id,
    pollId: comment.pollId,
    userId: comment.userId,
    body: comment.body,
    author: author(comment.userId),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    likesCount: [...(state.commentLikes.get(comment.id) ?? [])].filter(
      (userId) => activeUser(userId),
    ).length,
    liked: state.commentLikes.get(comment.id)?.has(current.id) ?? false,
  });
  const pollData = (poll: DemoPoll): Poll => {
    const options = poll.options
      .filter((option) => !option.deleted)
      .sort((a, b) => a.position - b.position);
    const activeIds = new Set(options.map((option) => option.id));
    const ballots = state.ballots.filter(
      (ballot) =>
        ballot.pollId === poll.id &&
        activeUser(ballot.userId) &&
        ballot.optionIds.some((optionId) => activeIds.has(optionId)),
    );
    return {
      id: poll.id,
      userId: poll.userId,
      title: poll.title,
      message: poll.message,
      selectionMode: poll.selectionMode,
      tags: [...poll.tags],
      author: author(poll.userId),
      options: options.map((option) => ({
        id: option.id,
        pollId: poll.id,
        text: option.text,
        position: option.position,
        selectionsCount: ballots.filter((ballot) =>
          ballot.optionIds.includes(option.id),
        ).length,
      })),
      participantsCount: ballots.length,
      commentsCount: state.comments.filter(
        (comment) => comment.pollId === poll.id && visibleComment(comment),
      ).length,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
    };
  };
  function page<T>(rows: T[], paging: { limit: number; offset: number }) {
    const available = context.scenario === 'empty' ? [] : rows;
    const data = available.slice(paging.offset, paging.offset + paging.limit);
    const hasMore = paging.offset + paging.limit < available.length;
    return {
      data,
      page: {
        ...paging,
        hasMore,
        nextOffset: hasMore ? paging.offset + paging.limit : null,
      },
    };
  }
  if (id === 'status' && !action && method === 'GET')
    return json({ enabled: portal.settings.communityEnabled });
  if (id === 'comments' && action) {
    if (!detail && (method === 'PATCH' || method === 'DELETE')) {
      const comment = requireComment(action, method === 'DELETE');
      if (comment.userId !== current.id) throw new OwnershipError();
      if (method === 'DELETE') {
        comment.deleted = true;
        return noContent();
      }
      Object.assign(
        comment,
        PollCommentInputSchema.parse(await readInput(request)),
        { updatedAt: new Date().toISOString() },
      );
      return json(commentData(comment));
    }
    if (detail === 'reaction' && method === 'POST') {
      const { liked } = PollReactionInputSchema.parse(await readInput(request));
      const comment = requireComment(action, !liked);
      const likes = state.commentLikes.get(comment.id) ?? new Set<string>();
      if (liked) likes.add(current.id);
      else likes.delete(current.id);
      state.commentLikes.set(comment.id, likes);
      return json({
        liked,
        likesCount: visibleComment(comment)
          ? commentData(comment).likesCount
          : 0,
      });
    }
    throw new NotFoundError();
  }
  if (!id && method === 'GET') {
    const query = PollQuerySchema.parse(Object.fromEntries(url.searchParams));
    const search = query.query.toLocaleLowerCase('en-US');
    const matches = state.polls
      .filter(
        (poll) =>
          visiblePoll(poll) &&
          (query.scope !== 'mine' || poll.userId === current.id) &&
          (!query.selectionMode ||
            query.selectionMode === poll.selectionMode) &&
          (!query.tag || poll.tags.includes(query.tag)) &&
          (!query.createdAfter ||
            Date.parse(poll.createdAt) >= Date.parse(query.createdAfter)) &&
          (!query.createdBefore ||
            Date.parse(poll.createdAt) <= Date.parse(query.createdBefore)) &&
          `${poll.title} ${poll.message}`
            .toLocaleLowerCase('en-US')
            .includes(search),
      )
      .sort(newest);
    return json(
      page(matches.map(pollData), { limit: query.limit, offset: query.offset }),
    );
  }
  if (!id && method === 'POST') {
    const input = PollInputSchema.parse(await readInput(request));
    if (input.options.some((option) => option.id))
      throw new ValidationError(copy.validation.optionsDescription);
    const now = new Date().toISOString();
    const poll: DemoPoll = {
      ...input,
      options: input.options.map((option, position) => ({
        id: crypto.randomUUID(),
        text: option.text,
        position,
        deleted: false,
      })),
      id: crypto.randomUUID(),
      userId: current.id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      hidden: false,
    };
    state.polls.unshift(poll);
    return json(pollData(poll), 201);
  }
  if (!id) throw new NotFoundError();
  const poll = requirePoll(id, method === 'DELETE');
  if (!action) {
    if (method === 'GET') return json(pollData(poll));
    if (method === 'PATCH' || method === 'DELETE') {
      if (poll.userId !== current.id) throw new OwnershipError();
      if (method === 'DELETE') {
        poll.deleted = true;
        return noContent();
      }
      const input = PollInputSchema.parse(await readInput(request));
      const activeOptions = poll.options.filter((option) => !option.deleted);
      if (
        input.options.some(
          (option) =>
            option.id &&
            !activeOptions.some((existing) => existing.id === option.id),
        )
      )
        throw new ValidationError(copy.validation.optionsDescription);
      const hasBallots = state.ballots.some(
        (ballot) => ballot.pollId === poll.id,
      );
      if (
        hasBallots &&
        (input.title !== poll.title ||
          input.message !== poll.message ||
          input.selectionMode !== poll.selectionMode ||
          input.options.length !== activeOptions.length ||
          input.options.some(
            (option) =>
              !option.id ||
              !activeOptions.some(
                (existing) =>
                  existing.id === option.id && existing.text === option.text,
              ),
          ))
      )
        throw new ApiError(copy.validation.historyDescription, 409);
      const nextIds = new Set(
        input.options.flatMap((option) => (option.id ? [option.id] : [])),
      );
      const retired = poll.options.filter(
        (option) => option.deleted || !nextIds.has(option.id),
      );
      poll.options = [
        ...input.options.map((option, position) => ({
          id: option.id ?? crypto.randomUUID(),
          text: option.text,
          position,
          deleted: false,
        })),
        ...retired.map((option, index) => ({
          ...option,
          deleted: true,
          position: input.options.length + index,
        })),
      ];
      Object.assign(poll, {
        title: input.title,
        message: input.message,
        selectionMode: input.selectionMode,
        tags: input.tags,
        updatedAt: new Date().toISOString(),
      });
      return json(pollData(poll));
    }
  }
  if (action === 'ballot' && !detail) {
    const own = state.ballots.find(
      (ballot) => ballot.pollId === poll.id && ballot.userId === current.id,
    );
    if (method === 'GET') return json(own ?? null);
    if (method === 'DELETE') {
      state.ballots = state.ballots.filter((ballot) => ballot !== own);
      return noContent();
    }
    if (method === 'PUT') {
      const { optionIds } = PollBallotInputSchema.parse(
        await readInput(request),
      );
      if (poll.selectionMode === 'SINGLE' && optionIds.length !== 1)
        throw new ValidationError(copy.validation.singleDescription);
      const options = poll.options.filter((option) => !option.deleted);
      if (options.length < 2 || options.length > 100)
        throw new ApiError(copy.validation.optionsDescription, 409);
      if (
        optionIds.some(
          (optionId) => !options.some((option) => option.id === optionId),
        )
      )
        throw new ValidationError(copy.validation.ballotDescription);
      const now = new Date().toISOString();
      if (own) {
        own.optionIds = optionIds;
        own.updatedAt = now;
        return json(own);
      }
      const ballot = {
        id: crypto.randomUUID(),
        userId: current.id,
        pollId: poll.id,
        optionIds,
        createdAt: now,
        updatedAt: now,
      };
      state.ballots.push(ballot);
      return json(ballot);
    }
  }
  if (action === 'comments' && !detail) {
    if (method === 'GET') {
      const paging = PollPagingSchema.parse(
        Object.fromEntries(url.searchParams),
      );
      return json(
        page(
          state.comments
            .filter(
              (comment) =>
                comment.pollId === poll.id && visibleComment(comment),
            )
            .sort(newest)
            .map(commentData),
          paging,
        ),
      );
    }
    if (method === 'POST') {
      const input = PollCommentInputSchema.parse(await readInput(request));
      const now = new Date().toISOString();
      const comment = {
        ...input,
        id: crypto.randomUUID(),
        pollId: poll.id,
        userId: current.id,
        createdAt: now,
        updatedAt: now,
        deleted: false,
        hidden: false,
      };
      state.comments.unshift(comment);
      return json(commentData(comment), 201);
    }
  }
  throw new NotFoundError();
}
