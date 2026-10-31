import { normalizeContentTags } from '@/utils/normalizeContentTag';
import 'server-only';
import { demoMedia } from '@/services/demo/demoMedia';
import type { CommunityAttachment } from '@/modules/community/models/communityAttachment';
import { getDemoState } from '@/services/demo/demoState';
import { gentlePathPollStrings as copy } from '@/strings';
import type { DemoPollState } from './models/demoPollState';

const globalPolls = globalThis as typeof globalThis & {
  gentlePathPollState?: DemoPollState;
};

export function getDemoPollState(): DemoPollState {
  if (!globalPolls.gentlePathPollState) {
    const accounts = getDemoState().users;
    const now = Date.now();
    const scenarios = [
      {
        title: copy.demo.routineTitle,
        message: copy.demo.routineMessage,
        choices: copy.demo.routineOptions,
        selectionMode: 'SINGLE' as const,
        userId: accounts[0].id,
      },
      {
        title: copy.demo.schoolTitle,
        message: copy.demo.schoolMessage,
        choices: copy.demo.schoolOptions,
        selectionMode: 'MULTIPLE' as const,
        userId: accounts[1].id,
      },
      {
        title: copy.demo.weekendTitle,
        message: copy.demo.weekendMessage,
        choices: copy.demo.weekendOptions,
        selectionMode: 'SINGLE' as const,
        userId: accounts[2].id,
      },
    ];
    const polls = scenarios.map((item, index) => ({
      id: crypto.randomUUID(),
      userId: item.userId,
      title: item.title,
      message: item.message,
      selectionMode: item.selectionMode,
      votingLocked: index < 2,
      tags: [],
      attachments: (index === 0
        ? [
            {
              kind: 'IMAGE',
              url: demoMedia.reading,
              description: copy.demo.routineImage,
            },
          ]
        : []) as CommunityAttachment[],
      options: item.choices.map((text, position) => ({
        id: crypto.randomUUID(),
        text,
        position,
        deleted: false,
      })),
      createdAt: new Date(now - (index + 1) * 86400000).toISOString(),
      updatedAt: new Date(now - (index + 1) * 86400000).toISOString(),
      deleted: false,
      hidden: false,
    }));
    const createdAt = new Date(now - 3600000).toISOString();
    const rootCommentId = crypto.randomUUID();
    globalPolls.gentlePathPollState = {
      polls,
      ballots: [
        ...accounts.map((account, index) => ({
          id: crypto.randomUUID(),
          userId: account.id,
          pollId: polls[0].id,
          optionIds: [polls[0].options[index === 0 ? 1 : 0].id],
          createdAt,
          updatedAt: createdAt,
        })),
        ...accounts.slice(0, 2).map((account, index) => ({
          id: crypto.randomUUID(),
          userId: account.id,
          pollId: polls[1].id,
          optionIds: [polls[1].options[0].id, polls[1].options[index + 1].id],
          createdAt,
          updatedAt: createdAt,
        })),
      ],
      comments: [copy.demo.commentOne, copy.demo.commentTwo].map(
        (body, index) => ({
          id: index === 0 ? rootCommentId : crypto.randomUUID(),
          pollId: polls[0].id,
          parentCommentId: index === 0 ? null : rootCommentId,
          userId: accounts[index + 1].id,
          body,
          createdAt,
          updatedAt: createdAt,
          deleted: false,
          hidden: false,
        }),
      ),
      commentLikes: new Map(),
    };
  }
  for (const record of globalPolls.gentlePathPollState.polls) {
    record.tags = normalizeContentTags(record.tags);
    record.attachments ??= [];
  }
  for (const comment of globalPolls.gentlePathPollState.comments)
    comment.parentCommentId ??= null;
  return globalPolls.gentlePathPollState;
}
export function resetDemoPollState() {
  globalPolls.gentlePathPollState = undefined;
}
