'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  InlineLoading,
  QueryBoundary,
  SuccessCelebration,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy, strings } from '@/strings';
import type { Poll } from '../models/poll';
import type { PollBallot } from '../models/pollBallot';
import { useClearPollVote, usePollBallot, useVotePoll } from '../hooks';
import { usePollExpired } from '../usePollExpired';
import { PollAnswerOptions } from './PollAnswerOptions';

function PollVoteForm({
  poll,
  ballot,
  writable,
  compact,
  onVoted,
}: {
  poll: Poll;
  ballot: PollBallot | null;
  writable: boolean;
  compact: boolean;
  onVoted: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(ballot?.optionIds ?? []);
  const [validation, setValidation] = useState('');
  const vote = useVotePoll();
  const clear = useClearPollVote();
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const id = useId();
  const { showAlert, showToast } = usePresentationService();
  const pending = vote.isPending || clear.isPending;
  const expired = usePollExpired(poll);
  const disabled = !writable || pending || expired;
  const recordedIds = ballot?.optionIds ?? [];
  const unchanged =
    Boolean(ballot) &&
    selected.length === recordedIds.length &&
    selected.every((optionId) => recordedIds.includes(optionId));
  const Heading = compact ? 'h3' : 'h2';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !writable || unchanged) return;
    if (
      expired ||
      (poll.expiresAt && Date.parse(poll.expiresAt) <= Date.now())
    ) {
      setValidation(copy.expiredDescription);
      return;
    }
    if (!selected.length) {
      setValidation(copy.validation.ballotDescription);
      event.currentTarget.querySelector<HTMLElement>('input')?.focus();
      return;
    }
    busy.current = true;
    try {
      await vote.mutateAsync({ id: poll.id, optionIds: selected });
      dirty.current = false;
      setValidation('');
      onVoted();
      void showToast({ title: copy.voteSaved, intent: 'success' });
    } catch {
      /* Preserve selected choices for retry. */
    } finally {
      busy.current = false;
    }
  }

  async function remove() {
    if (busy.current || !writable) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.removeVoteTitle,
          description: copy.removeVoteDescription,
          tone: 'danger',
          confirmLabel: copy.removeVote,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await clear.mutateAsync(poll.id);
      dirty.current = false;
      setSelected([]);
      setValidation('');
      void showToast({ title: copy.voteRemoved, intent: 'success' });
    } catch {
      /* Inline error enables retry. */
    } finally {
      busy.current = false;
    }
  }

  return (
    <form noValidate onSubmit={submit} className="gp-poll-ballot">
      <div className="gp-poll-ballot__heading">
        <Heading className="m-0 text-sm font-semibold text-primary">
          {copy.voteTitle}
        </Heading>
        {ballot && <Badge intent="success">{copy.voted}</Badge>}
      </div>
      <p id={`${id}-hint`} className="m-0 text-sm text-secondary">
        {expired
          ? copy.expiredDescription
          : poll.selectionMode === 'SINGLE'
            ? copy.singleHint
            : copy.multipleHint}
      </p>
      {poll.expiresAt && (
        <p className="m-0 text-sm text-tertiary">
          {copy.expires}{' '}
          <time dateTime={poll.expiresAt}>
            {new Date(poll.expiresAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </time>
        </p>
      )}
      <PollAnswerOptions
        poll={poll}
        selectedIds={selected}
        recordedIds={recordedIds}
        name={`${id}-option`}
        disabled={disabled}
        invalid={Boolean(validation)}
        describedBy={`${id}-hint${validation ? ` ${id}-validation` : ''}`}
        onSelect={(optionId) => {
          setValidation('');
          const next =
            poll.selectionMode === 'SINGLE'
              ? [optionId]
              : selected.includes(optionId)
                ? selected.filter((value) => value !== optionId)
                : [...selected, optionId];
          dirty.current =
            next.length !== recordedIds.length ||
            next.some((value) => !recordedIds.includes(value));
          setSelected(next);
        }}
      />
      {validation && (
        <p
          id={`${id}-validation`}
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {validation}
        </p>
      )}
      <MutationError error={vote.error ?? clear.error} />
      <div className="gp-poll-ballot__footer">
        <span className="inline-flex items-center gap-2 text-sm text-secondary">
          <UiIcon name="chart" className="size-4" />
          {copy.participants(poll.participantsCount)}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {ballot && (
            <Button
              variant="destructive"
              loading={clear.isPending}
              disabled={!writable || vote.isPending}
              onClick={() => {
                void remove();
              }}
            >
              {copy.removeVote}
            </Button>
          )}
          <Button
            type="submit"
            loading={vote.isPending}
            disabled={!writable || clear.isPending || expired || unchanged}
          >
            <UiIcon name={unchanged ? 'check' : 'chart'} className="size-4" />
            {unchanged ? copy.voted : ballot ? copy.updateVote : copy.vote}
          </Button>
        </div>
      </div>
      {!compact && (
        <p className="m-0 text-xs text-tertiary">{copy.resultsHint}</p>
      )}
    </form>
  );
}

export function PollVote({
  poll,
  writable,
  compact = false,
}: {
  poll: Poll;
  writable: boolean;
  compact?: boolean;
}) {
  const query = usePollBallot(poll.id);
  const [celebration, setCelebration] = useState(0);
  const status =
    query.isError && 'status' in query.error
      ? Number(query.error.status)
      : undefined;
  const retainBallot =
    query.data !== undefined && ![401, 403, 404].includes(Number(status));
  const id = useId();
  return (
    <div className={`gp-poll-vote${compact ? ' gp-poll-vote--compact' : ''}`}>
      <SuccessCelebration sequence={celebration} />
      {query.isError && retainBallot && (
        <div className="mb-4 grid gap-2">
          <MutationError error={query.error} />
          <Button
            variant="ghost"
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
      <QueryBoundary
        query={query}
        showError={!retainBallot}
        loadingFallback={
          <div className="gp-poll-ballot" aria-busy="true">
            <p id={`${id}-loading`} className="m-0 text-sm text-secondary">
              {poll.selectionMode === 'SINGLE'
                ? copy.singleHint
                : copy.multipleHint}
            </p>
            <PollAnswerOptions
              poll={poll}
              selectedIds={[]}
              recordedIds={[]}
              name={`${id}-pending`}
              disabled
              invalid={false}
              describedBy={`${id}-loading`}
              onSelect={() => {}}
            />
            <InlineLoading />
          </div>
        }
      >
        {(ballot) => (
          <PollVoteForm
            key={ballot ? `${ballot.id}:${ballot.updatedAt}` : 'no-ballot'}
            poll={poll}
            ballot={ballot}
            writable={writable}
            compact={compact}
            onVoted={() => setCelebration((current) => current + 1)}
          />
        )}
      </QueryBoundary>
    </div>
  );
}
