'use client';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Field,
  QueryBoundary,
  Select,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { CommunityHub } from '@/modules/community/components/CommunityHub';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from './models/poll';
import { usePolls, usePollStatus } from './hooks';
import { usePollDirectory } from './usePollDirectory';
import { usePollActions } from './usePollActions';
import { PollCard } from './components/PollCard';
import { PollEditor } from './components/PollEditor';
import '@/modules/portal/styles/portal.css';
import './styles/polls.css';

const mineScope = 'mine';
const anyMode = '';

export function PollsScreen() {
  const directory = usePollDirectory();
  const query = usePolls({
    query: directory.query,
    tag: directory.tag,
    scope: directory.scope,
    selectionMode: directory.selectionMode,
    limit: 25,
    offset: directory.offset,
  });
  const status = usePollStatus();
  const writable = status.data?.enabled === true;
  const { session } = useSessionState();
  const [editor, setEditor] = useState<Poll | 'new' | null>(null);
  const remove = usePollActions(() => {
    if (query.data?.data.length === 1 && directory.offset)
      directory.setOffset(Math.max(0, directory.offset - 25));
  });
  const filtered = Boolean(
    directory.query ||
    directory.tag ||
    directory.selectionMode ||
    directory.scope === 'mine',
  );
  function clearFilters() {
    directory.update({
      query: undefined,
      tag: undefined,
      mode: undefined,
      scope: undefined,
      offset: undefined,
    });
  }
  return (
    <CommunityHub
      activeView="polls"
      action={
          <Button disabled={!writable} onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.newPoll}
          </Button>
      }
    >
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
      <Card>
        <DirectoryFilters
          id="poll-search"
          value={{
            query: directory.query,
            status: directory.scope === 'mine' ? mineScope : undefined,
          }}
          onChange={(value) =>
            directory.update({
              query: value.query || undefined,
              scope: value.status,
              offset: undefined,
            })
          }
          statuses={[{ value: mineScope, label: copy.myPolls }]}
          copy={{
            search: copy.search,
            placeholder: copy.searchPlaceholder,
            clear: copy.clear,
            status: copy.view,
            allStatuses: copy.allPolls,
          }}
          additionalFilters={
            <Field labelText={copy.modeLabel}>
              <Select
                value={directory.selectionMode ?? ''}
                onValueChange={(value) =>
                  directory.update({
                    mode: value || undefined,
                    offset: undefined,
                  })
                }
              >
                <option value={anyMode}>{copy.allModes}</option>
                {Object.entries(copy.modes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          }
        />
      </Card>
      {directory.tag && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{directory.tag}</Badge>
          <Button
            variant="ghost"
            onClick={() =>
              directory.update({ tag: undefined, offset: undefined })
            }
          >
            {copy.clearTag}
          </Button>
        </div>
      )}
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="grid gap-5">
                {result.data.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    own={poll.userId === session?.user.id}
                    writable={writable}
                    busy={remove.isPending}
                    returnTo={directory.href}
                    onEdit={() => setEditor(poll)}
                    onDelete={() => {
                      void remove.deletePoll(poll);
                    }}
                    onTag={(tag) =>
                      directory.update({ tag, offset: undefined })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={filtered ? copy.noResultsTitle : copy.noPollsTitle}
                description={filtered ? copy.noResultsHint : copy.noPollsHint}
                action={
                  <Button
                    disabled={!filtered && !writable}
                    onClick={() =>
                      filtered ? clearFilters() : setEditor('new')
                    }
                  >
                    {filtered ? copy.clearFilters : copy.newPoll}
                  </Button>
                }
              />
            )}
            <DirectoryPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              label={copy.pagination}
              range={copy.range}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
      {editor && (
        <PollEditor
          key={editor === 'new' ? 'new' : editor.id}
          poll={editor === 'new' ? undefined : editor}
          writable={writable}
          onClose={() => setEditor(null)}
          onSaved={editor === 'new' ? () => directory.setOffset(0) : undefined}
        />
      )}
    </CommunityHub>
  );
}
