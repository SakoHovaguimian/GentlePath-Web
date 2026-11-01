import 'server-only';
import { NotFoundError } from '@/errors/domainErrors';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { getDemoPollState } from '@/modules/polls/demo/pollState';
import { getDemoMilestoneAdminState } from '@/modules/milestone-admin/server/demoMilestoneAdminState';
import { gentlePathCommunityDiscoveryStrings as copy } from '@/strings';
import { getDemoEffectiveTimezone } from '@/modules/notification-inbox/demo/notificationInboxState';
import { completedYears } from '../models/ageBand';
import { CommunityPagingSchema } from '../models/communityPaging';
import { CommunityProfileActivityKindSchema } from '../models/communityProfileActivityKind';
import { getDemoCommunityState } from './communityState';
import { isDemoCommentVisible } from './isDemoCommentVisible';

export function demoCommunityProfile(
  id: string,
  action: string | undefined,
  query: Record<string, string>,
  context: DemoContext,
) {
  const accounts = getDemoState();
  const active = (userId: string) =>
    accounts.users.find(
      (user) => user.id === userId && !user.deleted && !user.disabled,
    );
  const user = active(id);
  if (!user) throw new NotFoundError();
  const community = getDemoCommunityState();
  const polling = getDemoPollState();
  const milestones = getDemoMilestoneAdminState();
  const visible = <
    T extends { userId: string; deleted: boolean; hidden: boolean },
  >(
    item: T,
  ) => !item.deleted && !item.hidden && Boolean(active(item.userId));
  const posts = community.posts.filter(
    (post) => post.userId === id && visible(post),
  );
  const polls = polling.polls.filter(
    (poll) => poll.userId === id && visible(poll),
  );
  const tips = milestones.tips.filter(
    (tip) =>
      tip.user_id === id &&
      !tip.deleted &&
      tip.approval_status === 'APPROVED' &&
      !milestones.hiddenMilestoneIds.has(tip.milestone_id),
  );
  const postComments = community.comments.filter(
    (comment) =>
      comment.userId === id &&
      isDemoCommentVisible(
        comment,
        community.comments,
        (item) => item.postId,
        active,
      ) &&
      community.posts.some(
        (post) => post.id === comment.postId && visible(post),
      ),
  );
  const pollComments = polling.comments.filter(
    (comment) =>
      comment.userId === id &&
      isDemoCommentVisible(
        comment,
        polling.comments,
        (item) => item.pollId,
        active,
      ) &&
      polling.polls.some((poll) => poll.id === comment.pollId && visible(poll)),
  );
  if (!action) {
    const now = new Date();
    const timezone = getDemoEffectiveTimezone(id);
    const ages = getDemoPortalState()
      .children.filter((child) => child.userId === id)
      .map((child) => completedYears(child.dateOfBirth, timezone, now))
      .sort((a, b) => a - b);
    return {
      id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role ?? 'user',
      child_count: ages.length,
      child_ages: ages,
      activity_counts:
        context.scenario === 'empty'
          ? { posts: 0, polls: 0, tips: 0, comments: 0 }
          : {
              posts: posts.length,
              polls: polls.length,
              tips: tips.length,
              comments: postComments.length + pollComments.length,
            },
    };
  }
  const kind = CommunityProfileActivityKindSchema.parse(action);
  const paging = CommunityPagingSchema.parse(query);
  const records = {
    posts: posts.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      href: `/community/${encodeURIComponent(item.id)}`,
      createdAt: item.createdAt,
    })),
    polls: polls.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.message,
      href: `/polls/${encodeURIComponent(item.id)}`,
      createdAt: item.createdAt,
    })),
    tips: tips.map((item) => ({
      id: item.id,
      title: copy.activity.tips,
      body: item.message,
      href: `/tips?tip=${encodeURIComponent(item.id)}`,
      createdAt: item.created_at,
    })),
    post_comments: postComments.map((item) => ({
      id: item.id,
      title: copy.commentLink,
      body: item.body,
      href: `/community/${encodeURIComponent(item.postId)}`,
      createdAt: item.createdAt,
    })),
    poll_comments: pollComments.map((item) => ({
      id: item.id,
      title: copy.commentLink,
      body: item.body,
      href: `/polls/${encodeURIComponent(item.pollId)}`,
      createdAt: item.createdAt,
    })),
  }[kind].sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );
  const rows = context.scenario === 'empty' ? [] : records;
  const hasMore = paging.offset + paging.limit < rows.length;
  return {
    data: rows.slice(paging.offset, paging.offset + paging.limit),
    page: {
      ...paging,
      hasMore,
      nextOffset: hasMore ? paging.offset + paging.limit : null,
    },
  };
}
