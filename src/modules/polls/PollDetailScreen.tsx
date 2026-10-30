'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathPollStrings as copy, strings } from '@/strings';
import type { Poll } from './models/poll';
import { usePollExpired } from './usePollExpired';
import { usePoll, usePollStatus } from './hooks';
import { pollReturnPath } from './usePollDirectory';
import { usePollActions } from './usePollActions';
import { PollIdentity } from './components/PollIdentity';
import { PollEditor } from './components/PollEditor';
import { PollVote } from './components/PollVote';
import { PollComments } from './components/PollComments';
import { PollMenu } from './components/PollMenu';
import { CommunityAttachments } from '@/modules/community/components/CommunityAttachments';
import '@/modules/portal/styles/portal.css';
import '@/modules/community/styles/community.css';
import './styles/polls.css';

function PollDetail({ poll, returnTo }: { poll: Poll; returnTo: string }) {
  const { session } = useSessionState();
  const router = useRouter();
  const status = usePollStatus();
  const writable = status.data?.enabled === true;
  const [editor, setEditor] = useState(false);
  const onDeleted = () => router.replace(returnTo as Route);
  const remove = usePollActions(onDeleted);
  const own = poll.userId === session?.user.id;
  const expired = usePollExpired(poll);

  return (
    <>
      {status.data?.enabled === false && (
        <Card role="status">
          <h2 className="m-0 text-base font-semibold">{copy.pausedTitle}</h2>
          <p className="m-0 mt-2 text-sm text-secondary">
            {copy.pausedDescription}
          </p>
        </Card>
      )}
      <MutationError error={remove.error ?? status.error} />
      <article
        className="gp-community-thread gp-poll-thread"
        aria-label={poll.title}
      >
        <div className="gp-community-thread__opening">
          <div className="gp-community-post__header">
            <PollIdentity
              author={poll.author}
              createdAt={poll.createdAt}
              updatedAt={poll.updatedAt}
              own={own}
            />
            <PollMenu
              contentId={poll.id}
              own={own}
              writable={writable}
              busy={remove.isPending}
              onOpen={() => {
                const heading = document.getElementById(
                  'poll-discussion-title',
                );
                heading?.scrollIntoView({ block: 'start' });
                heading?.focus({ preventScroll: true });
              }}
              onEdit={() => setEditor(true)}
              onDelete={() => {
                void remove.deletePoll(poll);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              intent={poll.selectionMode === 'MULTIPLE' ? 'purple' : 'brand'}
            >
              {copy.modes[poll.selectionMode]}
            </Badge>
            {expired && <Badge intent="warning">{copy.expired}</Badge>}
          </div>
          <PageHeader title={poll.title} eyebrow={copy.detailTitle} />
        </div>
        <div className="gp-community-thread__content">
          <p className="gp-poll-body">{poll.message}</p>
          <CommunityAttachments items={poll.attachments} />
          {poll.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {poll.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
          <PollVote poll={poll} writable={writable} />
          <div className="gp-community-post__footer">
            <Button asChild variant="ghost">
              <a href="#poll-discussion-title">
                <UiIcon name="chat" className="size-4" />
                {copy.comments(poll.commentsCount)}
              </a>
            </Button>
            <SavedContentButton
              contentType="POLL"
              contentId={poll.id}
              variant="ghost"
            />
          </div>
        </div>
      </article>
      <PollComments
        pollId={poll.id}
        count={poll.commentsCount}
        writable={writable}
      />
      {editor && (
        <PollEditor
          poll={poll}
          writable={writable}
          onClose={() => setEditor(false)}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}

export function PollDetailScreen({ id }: { id: string }) {
  const query = usePoll(id);
  const params = useSearchParams();
  const returnTo = pollReturnPath(params.get('returnTo'));
  const { confirmNavigation } = useNavigationGuard();
  const errorStatus =
    query.isError && 'status' in query.error
      ? Number(query.error.status)
      : undefined;
  const retainPoll =
    query.data !== undefined && ![401, 403, 404].includes(Number(errorStatus));

  return (
    <Page className="gp-portal-page gp-polls gp-community-detail">
      <Button asChild variant="ghost" className="justify-self-start">
        <NavigationLink href={returnTo} beforeNavigate={confirmNavigation}>
          <UiIcon name="chevronLeft" className="size-4" />
          {copy.back}
        </NavigationLink>
      </Button>
      {errorStatus === 404 ? (
        <EmptyState
          title={copy.unavailableTitle}
          description={copy.validation.unavailableDescription}
          action={
            <Button asChild>
              <NavigationLink
                href={returnTo}
                beforeNavigate={confirmNavigation}
              >
                {copy.back}
              </NavigationLink>
            </Button>
          }
        />
      ) : (
        <>
          {query.isError && retainPoll && (
            <div className="grid gap-2">
              <MutationError error={query.error} />
              <Button
                variant="secondary"
                className="justify-self-start"
                loading={query.isFetching}
                onClick={() => {
                  void query.refetch();
                }}
              >
                {strings.ui.queryBoundary.tryAgain}
              </Button>
            </div>
          )}
          <QueryBoundary query={query} showError={!retainPoll}>
            {(poll) => (
              <PollDetail key={poll.id} poll={poll} returnTo={returnTo} />
            )}
          </QueryBoundary>
        </>
      )}
    </Page>
  );
}
