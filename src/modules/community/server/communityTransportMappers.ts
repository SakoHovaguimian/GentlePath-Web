import { CommunityContentKindSchema } from '../models/communityContentKind';
import { CommunityReportSchema } from '../models/communityReport';
import { CommunityPostSchema } from '../models/communityPost';
import { CommunityCommentSchema } from '../models/communityComment';
import type { CommunityAuthorTransport } from './models/communityAuthorTransport';
import type { CommunityPostTransport } from './models/communityPostTransport';
import type { CommunityCommentTransport } from './models/communityCommentTransport';
import type { CommunityReportTransport } from './models/communityReportTransport';
import { ModerationReportSchema } from '@/modules/portal/models/moderationReport';
import { gentlePathCommunityStrings as copy } from '@/strings';

function author(value: CommunityAuthorTransport | null | undefined) {
  return value
    ? { id: value.id, firstName: value.first_name, lastName: value.last_name }
    : null;
}
export function mapCommunityPost(
  value: CommunityPostTransport,
  liked: boolean,
) {
  return CommunityPostSchema.parse({
    id: value.id,
    userId: value.user_id,
    title: value.title,
    body: value.body,
    imageUrl: value.image_url,
    tags: value.tags,
    author: author(value.author),
    liked,
    likeCount: value.likes_count ?? 0,
    commentCount: value.comments_count ?? 0,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  });
}
export function mapCommunityComment(
  value: CommunityCommentTransport,
  liked: boolean,
) {
  return CommunityCommentSchema.parse({
    id: value.id,
    userId: value.user_id,
    postId: value.post_id,
    body: value.body,
    author: author(value.author),
    liked,
    likeCount: value.likes_count ?? 0,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  });
}
export function mapCommunityReport(value: CommunityReportTransport) {
  const targetType = CommunityContentKindSchema.parse(
    value.target_type.toLowerCase(),
  );
  const snapshot = value.target_snapshot;
  return CommunityReportSchema.parse({
    id: value.id,
    userId: value.user_id,
    targetId: value.target_id,
    targetType,
    reason: value.reason,
    status: value.status.toLowerCase(),
    resolutionNote: value.resolution_notes,
    reviewerId: value.reviewed_by_user_id,
    reviewedAt: value.reviewed_at,
    createdAt: value.created_at,
    snapshot: {
      id: snapshot.id,
      targetType: snapshot.content_type.toLowerCase(),
      title: snapshot.title,
      body: snapshot.body,
      tags: snapshot.tags,
      imageUrl: snapshot.image_url,
      description: snapshot.description,
      parentId: snapshot.parent_id,
      author: author(snapshot.author),
      createdAt: snapshot.created_at,
      updatedAt: snapshot.updated_at,
    },
  });
}

export function mapCommunityModerationReport(value: CommunityReportTransport) {
  return ModerationReportSchema.parse({
    id: value.id,
    contentTitle: value.target_snapshot.title ?? copy.commentSnapshotTitle,
    reason: value.reason,
    reporterName: copy.communityMember,
    status: value.status === 'IN_REVIEW' ? 'open' : value.status.toLowerCase(),
    createdAt: value.created_at,
    resolutionNote: value.resolution_notes ?? '',
    reviewerId: value.reviewed_by_user_id,
    reviewedAt: value.reviewed_at,
  });
}
