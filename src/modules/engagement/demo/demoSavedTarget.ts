import 'server-only';
import { getDemoBlogState } from '@/services/demo/demoBlogState';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoCommunityState } from '@/modules/community/demo/communityState';
import { getDemoPollState } from '@/modules/polls/demo/pollState';
import { getDemoMilestoneAdminState } from '@/modules/milestone-admin/server/demoMilestoneAdminState';
import {
  getVisibleDemoResources,
  getVisibleDemoGuides,
} from '@/modules/editorial/server/demoEditorialState';
import type { SavedContentType } from '../models/savedContentType';
import type { SavedContentTarget } from '../models/savedContentTarget';
import { savedContentReaderPath } from '../savedContentReaderPath';
export function demoSavedTarget(
  contentType: SavedContentType,
  id: string,
): SavedContentTarget | null {
  const activeUser = (userId: string) =>
    getDemoState().users.some((user) => user.id === userId && !user.deleted);
  const summary = (
    title: string | null,
    body: string | null,
    parentId: string | null = null,
    slug?: string,
  ): SavedContentTarget => ({
    id,
    contentType,
    title,
    preview: body?.slice(0, 500) ?? null,
    parentId,
    readerPath: savedContentReaderPath(contentType, id, parentId, slug),
  });
  if (contentType === 'RESOURCE') {
    const resource = getVisibleDemoResources().find((item) => item.id === id);
    return resource
      ? summary(resource.title, resource.description, resource.parent_id)
      : null;
  }
  if (contentType === 'GUIDED_STEP') {
    const guide = getVisibleDemoGuides().find((item) => item.id === id);
    return guide ? summary(guide.title, guide.description) : null;
  }
  if (contentType === 'BLOG') {
    const article = getDemoBlogState().find(
      (item) => item.id === id && item.status === 'published',
    );
    return article
      ? summary(article.title, article.description, null, article.slug)
      : null;
  }
  if (contentType === 'POST' || contentType === 'POST_COMMENT') {
    const state = getDemoCommunityState();
    const visiblePost = (post: (typeof state.posts)[number]) =>
      !post.deleted && !post.hidden && activeUser(post.userId);
    if (contentType === 'POST') {
      const post = state.posts.find(
        (item) => item.id === id && visiblePost(item),
      );
      return post ? summary(post.title, post.body) : null;
    }
    const comment = state.comments.find(
      (item) =>
        item.id === id &&
        !item.deleted &&
        !item.hidden &&
        activeUser(item.userId),
    );
    return comment &&
      state.posts.some(
        (post) => post.id === comment.postId && visiblePost(post),
      )
      ? summary(null, comment.body, comment.postId)
      : null;
  }
  if (contentType === 'POLL' || contentType === 'POLL_COMMENT') {
    const state = getDemoPollState();
    const visiblePoll = (poll: (typeof state.polls)[number]) =>
      !poll.deleted && !poll.hidden && activeUser(poll.userId);
    if (contentType === 'POLL') {
      const poll = state.polls.find(
        (item) => item.id === id && visiblePoll(item),
      );
      return poll ? summary(poll.title, poll.message) : null;
    }
    const comment = state.comments.find(
      (item) =>
        item.id === id &&
        !item.deleted &&
        !item.hidden &&
        activeUser(item.userId),
    );
    return comment &&
      state.polls.some(
        (poll) => poll.id === comment.pollId && visiblePoll(poll),
      )
      ? summary(null, comment.body, comment.pollId)
      : null;
  }
  if (contentType === 'MILESTONE' || contentType === 'TIP') {
    const state = getDemoMilestoneAdminState();
    const milestoneId =
      contentType === 'MILESTONE'
        ? id
        : state.tips.find((tip) => tip.id === id)?.milestone_id;
    const milestone = state.milestones.find(
      (item) =>
        item.id === milestoneId && !state.hiddenMilestoneIds.has(item.id),
    );
    if (!milestone) return null;
    if (contentType === 'MILESTONE')
      return summary(milestone.milestone, milestone.information);
    const tip = state.tips.find(
      (item) =>
        item.id === id &&
        !item.deleted &&
        item.approval_status === 'APPROVED' &&
        (!item.user_id || activeUser(item.user_id)),
    );
    return tip ? summary(null, tip.message, tip.milestone_id) : null;
  }
  return null;
}
