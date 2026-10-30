import { isDemoCommentVisible } from '@/modules/community/demo/isDemoCommentVisible';
import 'server-only';
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
  gentlePathCommunityStrings as copy,
  gentlePathDemoStrings as demoCopy,
} from '@/strings';
import {
  CommunityPostInputSchema,
  type CommunityPost,
} from '../models/communityPost';
import {
  CommunityCommentInputSchema,
  CommunityCommentUpdateInputSchema,
  type CommunityComment,
} from '../models/communityComment';
import {
  CommunityReportInputSchema,
  type CommunityReport,
} from '../models/communityReport';
import { CommunityReactionInputSchema } from '../models/communityReaction';
import { CommunityCommentQuerySchema } from '../models/communityCommentQuery';
import { CommunityPostQuerySchema } from '../models/communityPostQuery';
import { CommunityReportQuerySchema } from '../models/communityReportQuery';
import type { DemoCommunityPost } from './models/demoCommunityPost';
import type { DemoCommunityComment } from './models/demoCommunityComment';
import { getDemoCommunityState } from './communityState';

export {
  resetDemoCommunityState,
  hideDemoCommunityTarget,
} from './communityState';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
const input = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
const newest = <T extends { createdAt: string; id: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

export async function handleCommunityRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, resource, id, action, extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'community') return null;
  if (extra) throw new NotFoundError();
  const accounts = getDemoState();
  const current = accounts.users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!current || !session.demo) throw new AuthError();
  const portal = getDemoPortalState();
  if (portal.settings.maintenanceMode && (current.role ?? 'user') === 'user')
    throw new ApiError(demoCopy.maintenanceActive, 503);
  if (request.method !== 'GET' && !portal.settings.communityEnabled)
    throw new OwnershipError(demoCopy.communityPaused);
  const state = getDemoCommunityState();
  const method = request.method;
  const rawQuery = Object.fromEntries(url.searchParams);
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
  const visiblePost = (post: DemoCommunityPost) =>
    !post.deleted && !post.hidden && Boolean(activeUser(post.userId));
  const visibleComment = (comment: DemoCommunityComment): boolean =>
    isDemoCommentVisible(
      comment,
      state.comments,
      (item) => item.postId,
      activeUser,
    ) &&
    state.posts.some((post) => post.id === comment.postId && visiblePost(post));
  const requirePost = (postId: string, includeHidden = false) => {
    const post = state.posts.find(
      (post) => post.id === postId && (includeHidden || visiblePost(post)),
    );
    if (!post) throw new NotFoundError();
    return post;
  };
  const requireComment = (commentId: string, includeHidden = false) => {
    const comment = state.comments.find(
      (comment) =>
        comment.id === commentId && (includeHidden || visibleComment(comment)),
    );
    if (!comment) throw new NotFoundError();
    return comment;
  };
  const countLikes = (likes: Set<string> | undefined) =>
    [...(likes ?? [])].filter((userId) => activeUser(userId)).length;
  const postData = (post: DemoCommunityPost): CommunityPost => ({
    id: post.id,
    userId: post.userId,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    attachments: post.attachments?.length
      ? post.attachments
      : post.imageUrl
        ? [{ kind: 'IMAGE', url: post.imageUrl, description: post.title }]
        : [],
    tags: [...post.tags],
    author: author(post.userId),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likeCount: countLikes(state.postLikes.get(post.id)),
    liked: state.postLikes.get(post.id)?.has(current.id) ?? false,
    commentCount: state.comments.filter(
      (comment) => comment.postId === post.id && visibleComment(comment),
    ).length,
  });
  const commentData = (comment: DemoCommunityComment): CommunityComment => ({
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    body: comment.body,
    parentCommentId: comment.parentCommentId ?? null,
    author: author(comment.userId),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    likeCount: countLikes(state.commentLikes.get(comment.id)),
    liked: state.commentLikes.get(comment.id)?.has(current.id) ?? false,
  });
  const page = <T>(rows: T[], paging: { limit: number; offset: number }) => {
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
  };
  if (resource === 'status' && !id && method === 'GET')
    return json({ enabled: portal.settings.communityEnabled });
  if (resource === 'posts') {
    if (!id && method === 'GET') {
      const query = CommunityPostQuerySchema.parse(rawQuery);
      const search = query.query.toLocaleLowerCase();
      const posts = state.posts
        .filter(
          (post) =>
            visiblePost(post) &&
            (query.scope !== 'mine' || post.userId === current.id) &&
            (!query.tag || post.tags.includes(query.tag)) &&
            `${post.title} ${post.body}`.toLocaleLowerCase().includes(search),
        )
        .sort(newest);
      return json(
        page(posts.map(postData), { limit: query.limit, offset: query.offset }),
      );
    }
    if (!id && method === 'POST') {
      const body = CommunityPostInputSchema.parse(await input(request));
      if (body.attachments !== undefined)
        body.imageUrl =
          body.attachments.find((item) => item.kind === 'IMAGE')?.url ?? null;
      const now = new Date().toISOString();
      const post = {
        ...body,
        id: crypto.randomUUID(),
        userId: current.id,
        createdAt: now,
        updatedAt: now,
        deleted: false,
        hidden: false,
      };
      state.posts.unshift(post);
      return json(postData(post), 201);
    }
    if (id && !action) {
      const post = requirePost(id, method === 'DELETE');
      if (method === 'GET') return json(postData(post));
      if (method === 'PATCH' || method === 'DELETE') {
        if (post.userId !== current.id) throw new OwnershipError();
        if (method === 'PATCH') {
          const body = CommunityPostInputSchema.parse(await input(request));
          if (body.attachments !== undefined)
            body.imageUrl =
              body.attachments.find((item) => item.kind === 'IMAGE')?.url ??
              null;
          Object.assign(post, body, { updatedAt: new Date().toISOString() });
          return json(postData(post));
        }
        post.deleted = true;
        return noContent();
      }
    }
    if (id && action === 'comments') {
      const post = requirePost(id);
      if (method === 'GET') {
        const paging = CommunityCommentQuerySchema.parse(rawQuery);
        return json(
          page(
            state.comments
              .filter(
                (comment) =>
                  comment.postId === post.id &&
                  visibleComment(comment) &&
                  (!paging.rootOnly || !comment.parentCommentId) &&
                  (!paging.parentCommentId ||
                    comment.parentCommentId === paging.parentCommentId),
              )
              .sort((a, b) =>
                paging.rootOnly || paging.parentCommentId
                  ? newest(b, a)
                  : newest(a, b),
              )
              .map(commentData),
            paging,
          ),
        );
      }
      if (method === 'POST') {
        const body = CommunityCommentInputSchema.parse(await input(request));
        if (body.parentCommentId) {
          const parent = requireComment(body.parentCommentId);
          if (parent.postId !== post.id || parent.parentCommentId)
            throw new ValidationError(copy.validation.replyParent);
        }
        const now = new Date().toISOString();
        const comment = {
          ...body,
          parentCommentId: body.parentCommentId ?? null,
          id: crypto.randomUUID(),
          postId: post.id,
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
  }
  if (
    resource === 'comments' &&
    id &&
    !action &&
    (method === 'PATCH' || method === 'DELETE')
  ) {
    const comment = requireComment(id, method === 'DELETE');
    if (comment.userId !== current.id) throw new OwnershipError();
    if (method === 'PATCH') {
      Object.assign(
        comment,
        CommunityCommentUpdateInputSchema.parse(await input(request)),
        { updatedAt: new Date().toISOString() },
      );
      return json(commentData(comment));
    }
    comment.deleted = true;
    return noContent();
  }
  if (
    (resource === 'posts' || resource === 'comments') &&
    id &&
    action === 'reaction' &&
    method === 'POST'
  ) {
    const { liked } = CommunityReactionInputSchema.parse(await input(request));
    const target =
      resource === 'posts'
        ? requirePost(id, !liked)
        : requireComment(id, !liked);
    const likesMap =
      resource === 'posts' ? state.postLikes : state.commentLikes;
    const likes = likesMap.get(target.id) ?? new Set<string>();
    if (liked) likes.add(current.id);
    else likes.delete(current.id);
    likesMap.set(target.id, likes);
    const visible =
      resource === 'posts'
        ? visiblePost(target as DemoCommunityPost)
        : visibleComment(target as DemoCommunityComment);
    return json({ liked, likeCount: visible ? countLikes(likes) : 0 });
  }
  if (resource === 'reports' && !id) {
    const reportData = (reportId: string): CommunityReport => {
      const metadata = state.reports.find(
        (item) => item.id === reportId && item.userId === current.id,
      );
      const report = portal.reports.find((item) => item.id === reportId);
      if (!metadata || !report) throw new NotFoundError();
      return {
        ...metadata,
        snapshot: structuredClone(metadata.snapshot),
        reason: report.reason,
        status: report.status,
        resolutionNote: report.resolutionNote || null,
        reviewerId: report.reviewerId,
        reviewedAt: report.reviewedAt,
        createdAt: report.createdAt,
      };
    };
    if (method === 'GET') {
      const query = CommunityReportQuerySchema.parse(rawQuery);
      const search = query.query.toLocaleLowerCase();
      const reports = state.reports
        .filter(
          (item) =>
            item.userId === current.id &&
            portal.reports.some((report) => report.id === item.id),
        )
        .map((item) => reportData(item.id))
        .filter(
          (report) =>
            (!query.status || report.status === query.status) &&
            `${report.reason} ${report.resolutionNote ?? ''}`
              .toLocaleLowerCase()
              .includes(search),
        )
        .sort(newest);
      return json(page(reports, { limit: query.limit, offset: query.offset }));
    }
    if (method === 'POST') {
      const body = CommunityReportInputSchema.parse(await input(request));
      const target =
        body.targetType === 'post'
          ? requirePost(body.targetId)
          : requireComment(body.targetId);
      const snapshot = {
        id: target.id,
        targetType: body.targetType,
        title: 'title' in target ? target.title : null,
        body: target.body,
        ...('title' in target
          ? {
              tags: [...target.tags],
              imageUrl: target.imageUrl,
              attachments: structuredClone(target.attachments ?? []),
            }
          : {}),
        parentId: 'postId' in target ? target.postId : null,
        author: author(target.userId),
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
      };
      const report = {
        id: crypto.randomUUID(),
        contentTitle: snapshot.title ?? copy.commentSnapshotTitle,
        reason: body.reason,
        reporterName: `${current.first_name} ${current.last_name}`,
        status: 'open' as const,
        createdAt: new Date().toISOString(),
        resolutionNote: '',
        reviewerId: null,
        reviewedAt: null,
      };
      portal.reports.unshift(report);
      state.reports.unshift({
        id: report.id,
        userId: current.id,
        targetId: target.id,
        targetType: body.targetType,
        snapshot: structuredClone(snapshot),
      });
      return json(reportData(report.id), 201);
    }
  }
  throw new NotFoundError();
}
