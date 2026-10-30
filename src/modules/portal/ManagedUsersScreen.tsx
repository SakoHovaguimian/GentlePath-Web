'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  DataPanel,
  DataTable,
  DirectoryFilters,
  EmptyState,
  InitialsAvatar,
  MobileRecordRow,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { canManagePlatform } from '@/services/auth/permissions';
import { gentlePathPortalStrings as copy, strings } from '@/strings';
import { useManagedUsers } from './adminHooks';
import { usePortalDirectory } from './usePortalDirectory';
import type { ManagedUser } from './models/managedUser';
import { ManagedUserEditor } from './components/ManagedUserEditor';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';
import styles from './Admin.module.css';

export function ManagedUsersScreen() {
  const query = useManagedUsers();
  const { session } = useSessionState();
  const canEdit = session && canManagePlatform(session.user.role);
  const directory = usePortalDirectory();
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const filtered = (query.data ?? []).filter(
    (user) =>
      (!directory.status || user.role === directory.status) &&
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLocaleLowerCase()
        .includes(directory.query.toLocaleLowerCase()),
  );
  const offset = collectionOffset(directory.offset, filtered.length, 10);
  const avatar = (user: ManagedUser) => (
    <span className={styles.avatar} data-role={user.role}>
      <InitialsAvatar
        name={copy.common.personName(user.firstName, user.lastName)}
      />
    </span>
  );
  const status = (user: ManagedUser) => (
    <Badge intent={user.disabled ? 'warning' : 'success'} dot>
      {user.disabled ? copy.people.disabled : copy.people.active}
    </Badge>
  );
  const edit = (user: ManagedUser) =>
    canEdit ? (
      <Button
        variant="ghost"
        disabled={user.id === session?.user.id}
        onClick={() => setSelected(user)}
      >
        {copy.common.edit}
        <UiIcon name="chevronRight" className="size-4" />
      </Button>
    ) : null;

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <PageHeader
          title={copy.people.title}
          description={copy.people.description}
          eyebrow={copy.navigation.admin}
          icon={
            <span className={styles.roundIcon}>
              <UiIcon name="user" />
            </span>
          }
        />
      </div>
      {!canEdit && (
        <p className={styles.readOnly}>{copy.people.readOnlyHint}</p>
      )}
      <DataPanel
        className={styles.directoryPanel}
        busy={query.isFetching}
        busyLabel={strings.common.loading}
        toolbar={
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
            statuses={Object.entries(copy.people.roles).map(
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
        }
        footer={
          query.data && filtered.length ? (
            <CollectionPagination
              total={filtered.length}
              offset={offset}
              limit={10}
              onNavigate={directory.setOffset}
            />
          ) : undefined
        }
      >
        <QueryBoundary query={query} inset>
          {() =>
            filtered.length ? (
              <DataTable
                embedded
                caption={copy.people.title}
                rows={filtered.slice(offset, offset + 10)}
                getRowKey={(user) => user.id}
                renderMobileRow={(user) => (
                  <MobileRecordRow
                    leading={avatar(user)}
                    title={copy.common.personName(
                      user.firstName,
                      user.lastName,
                    )}
                    description={user.email}
                    summary={
                      <dl className="m-0 flex flex-wrap gap-x-2 gap-y-1 text-xs text-tertiary">
                        <dt>{copy.people.joined}</dt>
                        <dd className="m-0">
                          <time dateTime={user.createdAt}>
                            {new Date(user.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                dateStyle: 'medium',
                              },
                            )}
                          </time>
                        </dd>
                      </dl>
                    }
                    footer={
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{copy.people.roles[user.role]}</Badge>
                          {status(user)}
                        </div>
                        {edit(user)}
                      </>
                    }
                  />
                )}
                columns={[
                  {
                    key: 'name',
                    header: copy.people.name,
                    render: (user) => (
                      <div className={styles.person}>
                        {avatar(user)}
                        <div className={styles.personInfo}>
                          <span className="font-medium text-primary">
                            {copy.common.personName(
                              user.firstName,
                              user.lastName,
                            )}
                          </span>
                          <span className="text-xs text-tertiary">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'role',
                    header: copy.people.role,
                    render: (user) => (
                      <Badge>{copy.people.roles[user.role]}</Badge>
                    ),
                  },
                  {
                    key: 'status',
                    header: copy.common.status,
                    render: status,
                  },
                  {
                    key: 'createdAt',
                    header: copy.people.joined,
                    render: (user) => (
                      <time dateTime={user.createdAt}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          dateStyle: 'medium',
                        })}
                      </time>
                    ),
                  },
                  ...(canEdit
                    ? [
                        {
                          key: 'actions',
                          header: copy.common.actions,
                          render: edit,
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <EmptyState
                variant="plain"
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
            )
          }
        </QueryBoundary>
      </DataPanel>
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
