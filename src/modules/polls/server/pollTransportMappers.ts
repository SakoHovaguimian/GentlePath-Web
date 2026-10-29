import type { z } from 'zod';
import type { Poll } from '../models/poll';
import type { PollBallot } from '../models/pollBallot';
import type { PollComment } from '../models/pollComment';
import type { PollAuthorTransportSchema } from './models/pollAuthorTransport';
import type { PollTransportSchema } from './models/pollTransport';
import type { PollBallotTransportSchema } from './models/pollBallotTransport';
import type { PollCommentTransportSchema } from './models/pollCommentTransport';

function author(
  value: z.output<typeof PollAuthorTransportSchema> | null | undefined,
) {
  return value
    ? { id: value.id, firstName: value.first_name, lastName: value.last_name }
    : null;
}
export function mapPoll(value: z.output<typeof PollTransportSchema>): Poll {
  return {
    id: value.id,
    userId: value.user_id,
    title: value.title,
    message: value.message,
    selectionMode: value.selection_mode,
    tags: value.tags,
    author: author(value.author),
    options: (value.options ?? [])
      .filter((option) => !option.deleted)
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        id: option.id,
        pollId: option.poll_id,
        text: option.option_text,
        position: option.position,
        selectionsCount: option.selections_count ?? 0,
      })),
    expiresAt: value.expires_at ?? null,
    isExpired: value.is_expired ?? false,
    votingLocked: value.voting_locked ?? (value.participants_count ?? 0) > 0,
    participantsCount: value.participants_count ?? 0,
    commentsCount: value.comments_count ?? 0,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}
export function mapPollBallot(
  value: z.output<typeof PollBallotTransportSchema>,
): PollBallot {
  return {
    id: value.id,
    userId: value.user_id,
    pollId: value.poll_id,
    optionIds: (value.selections ?? []).map(
      (selection) => selection.poll_option_id,
    ),
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}
export function mapPollComment(
  value: z.output<typeof PollCommentTransportSchema>,
  liked: boolean,
): PollComment {
  return {
    id: value.id,
    pollId: value.poll_id,
    userId: value.user_id,
    author: author(value.author),
    body: value.body,
    likesCount: value.likes_count ?? 0,
    liked,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}
