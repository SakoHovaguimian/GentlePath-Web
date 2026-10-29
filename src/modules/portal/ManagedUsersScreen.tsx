'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  DirectoryFilters,
  EmptyState,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { canManagePlatform } from '@/services/auth/permissions';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useManagedUsers } from './adminHooks';
import { usePortalDirectory } from './usePortalDirectory';
import type { ManagedUser } from './models/managedUser';
import { ManagedUserEditor } from './components/ManagedUserEditor';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';

export function ManagedUsersScreen() {
  const query = useManagedUsers();
  const { session } = useSessionState();
  const canEdit = session && canManagePlatform(session.user.role);
  const directory = usePortalDirectory();
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  return (
    <div className="grid gap-7">
      <PageHeader
        title={copy.people.title}
        description={copy.people.description}
        eyebrow={copy.navigation.admin}
      />
      <DirectoryFilters
        id="people-search"
        value={{
          query: directory.query,
          status: directory.status || undefined,
        }}
        onChange={(value) =>
          directory.update({
            query: value.query,
            status: value.status,
            offset: undefined,
          })
        }
        statuses={Object.entries(copy.navigation.role).map(
          ([value, label]) => ({ value, label }),
        )}
        copy={{
          search: copy.common.search,
          placeholder: copy.people.searchPlaceholder,
          clear: copy.common.clear,
          status: copy.people.role,
          allStatuses: copy.people.allRoles,
        }}
      />
      {!canEdit && (
        <p className="m-0 text-sm text-tertiary">{copy.people.readOnlyHint}</p>
      )}
      <QueryBoundary query={query}>
        {(users) => {
          const filtered = users.filter(
            (user) =>
              (!directory.status || user.role === directory.status) &&
              `${user.firstName} ${user.lastName} ${user.email}`
                .toLocaleLowerCase()
                .includes(directory.query.toLocaleLowerCase()),
          );
          const offset = collectionOffset(
            directory.offset,
            filtered.length,
            10,
          );
          return filtered.length ? (
            <>
              <DataTable
                caption={copy.people.title}
                rows={filtered.slice(offset, offset + 10)}
                getRowKey={(user) => user.id}
                columns={[
                  {
                    key: 'name',
                    header: copy.people.name,
                    render: (user) => (
                      <div className="grid gap-1">
                        <span className="font-medium text-primary">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-tertiary">
                          {user.email}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: 'role',
                    header: copy.people.role,
                    render: (user) => (
                      <Badge>{copy.navigation.role[user.role]}</Badge>
                    ),
                  },
                  {
                    key: 'status',
                    header: copy.common.status,
                    render: (user) => (
                      <Badge intent={user.disabled ? 'warning' : 'success'}>
                        {user.disabled
                          ? copy.people.disabled
                          : copy.people.active}
                      </Badge>
                    ),
                  },
                  {
                    key: 'createdAt',
                    header: copy.people.joined,
                    render: (user) =>
                      new Date(user.createdAt).toLocaleDateString('en-US'),
                  },
                  ...(canEdit
                    ? [
                        {
                          key: 'actions',
                          header: copy.common.actions,
                          render: (user: ManagedUser) => (
                            <Button
                              variant="ghost"
                              disabled={user.id === session?.user.id}
                              onClick={() => setSelected(user)}
                            >
                              {copy.common.edit}
                            </Button>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
              <CollectionPagination
                total={filtered.length}
                offset={offset}
                limit={10}
                onNavigate={directory.setOffset}
              />
            </>
          ) : (
            <EmptyState
              title={copy.common.noResultsTitle}
              description={copy.common.noResultsHint}
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    directory.update({
                      query: undefined,
                      status: undefined,
                      offset: undefined,
                    })
                  }
                >
                  {copy.common.clear}
                </Button>
              }
            />
          );
        }}
      </QueryBoundary>
      {selected && (
        <ManagedUserEditor
          key={selected.id}
          user={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
