import { normalizeContentTags } from '@/utils/normalizeContentTag';
import 'server-only';
import { demoMedia } from '@/services/demo/demoMedia';
import type { CommunityAttachment } from '../models/communityAttachment';
import { getDemoState } from '@/services/demo/demoState';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { DemoCommunityState } from './models/demoCommunityState';

const globalCommunity = globalThis as typeof globalThis & {
  gentlePathCommunityState?: DemoCommunityState;
};

function createCommunityState(): DemoCommunityState {
  const users = getDemoState().users.filter((user) => !user.deleted);
  const daysAgo = (days: number) =>
    new Date(Date.now() - days * 86400000).toISOString();
  const posts = copy.demo.posts.map((seed, index) => ({
    ...seed,
    tags: [...seed.tags],
    id: `community-post-${index + 1}`,
    userId: users[index % users.length].id,
    imageUrl: index === 0 ? demoMedia.connection : null,
    attachments: (index === 0
      ? [
          {
            kind: 'IMAGE',
            url: demoMedia.connection,
            description: copy.demo.connectionImage,
          },
          {
            kind: 'IMAGE',
            url: demoMedia.reading,
            description: copy.demo.readingImage,
          },
        ]
      : index === 1
        ? [
            {
              kind: 'IMAGE',
              url: demoMedia.community,
              description: copy.demo.communityImage,
            },
            {
              kind: 'LINK',
              url: 'https://gentlepath.app/resources',
              description: copy.demo.resourcesLink,
            },
          ]
        : []) as CommunityAttachment[],
    createdAt: daysAgo(index + 1),
    updatedAt: daysAgo(index + 1),
    deleted: false,
    hidden: false,
  }));
  const comments = posts.flatMap((post, postIndex) =>
    copy.demo.comments.slice(0, postIndex % 2 ? 1 : 3).map((body, index) => ({
      id: `community-comment-${postIndex + 1}-${index + 1}`,
      postId: post.id,
      parentCommentId:
        index === 2 ? `community-comment-${postIndex + 1}-1` : null,
      userId: users[(postIndex + index + 1) % users.length].id,
      body,
      createdAt: daysAgo(postIndex + 0.75 - index / 10),
      updatedAt: daysAgo(postIndex + 0.75 - index / 10),
      deleted: false,
      hidden: false,
    })),
  );
  return {
    posts,
    comments,
    postLikes: new Map(
      posts.map((post, index) => [
        post.id,
        new Set([users[(index + 1) % users.length].id]),
      ]),
    ),
    commentLikes: new Map(),
    reports: [],
  };
}

export function getDemoCommunityState(): DemoCommunityState {
  const state = (globalCommunity.gentlePathCommunityState ??=
    createCommunityState());
  for (const record of state.posts) {
    record.tags = normalizeContentTags(record.tags);
    record.attachments ??= [];
  }
  for (const comment of state.comments) comment.parentCommentId ??= null;
  return state;
}

export function resetDemoCommunityState() {
  globalCommunity.gentlePathCommunityState = createCommunityState();
}

export function hideDemoCommunityTarget(
  targetType: 'post' | 'post_comment',
  id: string,
) {
  const state = getDemoCommunityState();
  const target = (targetType === 'post' ? state.posts : state.comments).find(
    (item) => item.id === id,
  );
  if (target) target.hidden = true;
}
