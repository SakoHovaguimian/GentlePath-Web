'use client';
import { useRef, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  PageSection,
  QueryBoundary,
  Radio,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from '../models/poll';
import type { PollBallot } from '../models/pollBallot';
import { useClearPollVote, usePollBallot, useVotePoll } from '../hooks';
import { PollResults } from './PollResults';

function PollVoteForm({
  poll,
  ballot,
  writable,
}: {
  poll: Poll;
  ballot: PollBallot | null;
  writable: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(ballot?.optionIds ?? []);
  const [validation, setValidation] = useState('');
  const vote = useVotePoll();
  const clear = useClearPollVote();
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const { showAlert, showToast } = usePresentationService();
  const pending = vote.isPending || clear.isPending;
  const disabled = !writable || pending;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !writable) return;
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
    <div className="gp-poll-voting-layout">
      <Card className="grid content-start gap-5">
        <PageSection
          id="poll-vote"
          title={copy.voteTitle}
          description={
            poll.selectionMode === 'SINGLE'
              ? copy.singleHint
              : copy.multipleHint
          }
          action={
            ballot ? <Badge intent="success">{copy.voted}</Badge> : undefined
          }
        >
          <form noValidate onSubmit={submit} className="grid gap-5">
            <fieldset
              disabled={disabled}
              aria-describedby={validation ? 'poll-vote-validation' : undefined}
              className="m-0 grid min-w-0 gap-2 border-0 p-0"
            >
              <legend className="sr-only">{copy.voteTitle}</legend>
              {poll.options.map((option) => {
                const checked = selected.includes(option.id);
                const props = {
                  name: 'poll-option',
                  value: option.id,
                  label: option.text,
                  checked,
                  disabled,
                  'aria-invalid': Boolean(validation),
                  className: 'gp-poll-vote-option',
                  onChange: () => {
                    dirty.current = true;
                    setValidation('');
                    setSelected((current) =>
                      poll.selectionMode === 'SINGLE'
                        ? [option.id]
                        : checked
                          ? current.filter((id) => id !== option.id)
                          : [...current, option.id],
                    );
                  },
                };
                return poll.selectionMode === 'SINGLE' ? (
                  <Radio key={option.id} {...props} />
                ) : (
                  <Checkbox key={option.id} {...props} />
                );
              })}
            </fieldset>
            {validation && (
              <p
                id="poll-vote-validation"
                role="alert"
                className="m-0 text-sm text-error-primary"
              >
                {validation}
              </p>
            )}
            <MutationError error={vote.error ?? clear.error} />
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                loading={vote.isPending}
                disabled={!writable || clear.isPending}
              >
                {ballot ? copy.updateVote : copy.vote}
              </Button>
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
            </div>
          </form>
        </PageSection>
      </Card>
      <Card>
        <PollResults poll={poll} selectedIds={ballot?.optionIds} />
      </Card>
    </div>
  );
}
export function PollVote({
  poll,
  writable,
}: {
  poll: Poll;
  writable: boolean;
}) {
  const query = usePollBallot(poll.id);
  return (
    <QueryBoundary query={query}>
      {(ballot) => (
        <PollVoteForm
          key={ballot ? `${ballot.id}:${ballot.updatedAt}` : 'no-ballot'}
          poll={poll}
          ballot={ballot}
          writable={writable}
        />
      )}
    </QueryBoundary>
  );
}
