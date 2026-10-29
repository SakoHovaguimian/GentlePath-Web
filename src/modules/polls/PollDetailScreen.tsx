'use client';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useSessionState } from '@/providers/AppProviders';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from './models/poll';
import { usePoll, usePollStatus } from './hooks';
import { pollReturnPath } from './usePollDirectory';
import { usePollActions } from './usePollActions';
import { PollIdentity } from './components/PollIdentity';
import { PollEditor } from './components/PollEditor';
import { PollVote } from './components/PollVote';
import { PollComments } from './components/PollComments';
import '@/modules/portal/styles/portal.css';
import './styles/polls.css';

function PollDetail({ poll, returnTo }: { poll: Poll; returnTo: string }) {
  const { session } = useSessionState();
  const router = useRouter();
  const navigate = useGuardedNavigate();
  const { confirmNavigation } = useNavigationGuard();
  const status = usePollStatus();
  const writable = status.data?.enabled === true;
  const [editor, setEditor] = useState(false);
  const remove = usePollActions(() => router.replace(returnTo as Route));
  const own = poll.userId === session?.user.id;
  return (
    <>
      <PageHeader
        title={poll.title}
        eyebrow={copy.detailTitle}
        breadcrumbs={[
          { label: copy.title, href: returnTo },
          { label: copy.detailTitle },
        ]}
        onNavigate={navigate}
        meta={
          <>
            <Badge intent="brand">{copy.modes[poll.selectionMode]}</Badge>
            <PollIdentity author={poll.author} createdAt={poll.createdAt} />
          </>
        }
        action={
          <>
            <SavedContentButton contentType="POLL" contentId={poll.id} />
            {own ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  disabled={!writable || remove.isPending}
                  onClick={() => setEditor(true)}
                >
                  {copy.editPoll}
                </Button>
                <Button
                  variant="ghost"
                  disabled={!writable}
                  loading={remove.isPending}
                  onClick={() => {
                    void remove.deletePoll(poll);
                  }}
                >
                  <UiIcon name="trash" />
                  {copy.deletePoll}
                </Button>
              </div>
            ) : null}
          </>
        }
      />
      <QueryBoundary query={status}>
        {(value) =>
          value.enabled ? null : (
            <Card role="status">
              <h2 className="m-0 text-base font-semibold">
                {copy.pausedTitle}
              </h2>
              <p className="m-0 mt-2 text-sm text-secondary">
                {copy.pausedDescription}
              </p>
            </Card>
          )
        }
      </QueryBoundary>
      <MutationError error={remove.error} />
      <div className="grid gap-4">
        <p className="gp-poll-body text-base">{poll.message}</p>
        {poll.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {poll.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </div>
      <PollVote poll={poll} writable={writable} />
      <PollComments
        pollId={poll.id}
        count={poll.commentsCount}
        writable={writable}
      />
      <Button asChild variant="secondary" className="justify-self-start">
        <NavigationLink
          href={returnTo}
          beforeNavigate={() => confirmNavigation()}
        >
          {copy.back}
        </NavigationLink>
      </Button>
      {editor && (
        <PollEditor
          poll={poll}
          writable={writable}
          onClose={() => setEditor(false)}
        />
      )}
    </>
  );
}
export function PollDetailScreen({ id }: { id: string }) {
  const query = usePoll(id);
  const params = useSearchParams();
  const returnTo = pollReturnPath(params.get('returnTo'));
  return (
    <Page className="gp-portal-page gp-polls">
      <QueryBoundary query={query}>
        {(poll) => <PollDetail poll={poll} returnTo={returnTo} />}
      </QueryBoundary>
    </Page>
  );
}
