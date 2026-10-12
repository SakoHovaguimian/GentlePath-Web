'use client';

import Link from 'next/link';
import { strings } from '@/strings';
import {
  DataPanel,
  DataTable,
  EmptyState,
  ErrorState,
  InitialsAvatar,
  InlineLoading,
  MobileRecordRow,
  Page,
  PageHeader,
} from '@/components/ui';
import { useUsers } from './hooks';

export function UsersScreen({ query = '' }: { query?: string }) {
  const { data, isPending, isError, refetch } = useUsers(query);
  return (
    <Page>
      <PageHeader
        title={strings.ui.appShell.users}
        description={
          strings.ui.usersScreen.findPeopleInYourWorkspaceAndViewTheirProfiles
        }
      />
      <DataPanel>
        {isPending ? (
          <div className="p-6">
            <InlineLoading message={strings.ui.usersScreen.loadingUsers} />
          </div>
        ) : isError || !data ? (
          <div className="p-4">
            <ErrorState
              title={strings.ui.usersScreen.usersUnavailable}
              description={strings.ui.usersScreen.weCouldNotLoadUsersRightNow}
              onRetry={() => void refetch()}
            />
          </div>
        ) : data.data.length === 0 ? (
          <EmptyState
            variant="plain"
            title={strings.ui.usersScreen.noUsersFound}
            description={strings.ui.usersScreen.tryADifferentSearch}
          />
        ) : (
          <DataTable
            embedded
            caption={strings.ui.usersScreen.userRecords}
            getRowKey={(row) => row.id}
            getRowHref={(row) => `/users/${row.id}`}
            renderMobileRow={(row) => (
              <MobileRecordRow
                title={
                  <Link href={`/users/${row.id}`}>
                    {row.firstName} {row.lastName}
                  </Link>
                }
                leading={
                  <InitialsAvatar name={`${row.firstName} ${row.lastName}`} />
                }
                description={row.email}
                footer={
                  <time dateTime={row.createdAt}>
                    {new Date(row.createdAt).toLocaleDateString()}
                  </time>
                }
              />
            )}
            columns={[
              {
                key: 'name',
                header: strings.ui.usersScreen.name,
                render: (row) => (
                  <Link
                    className="font-medium text-primary hover:text-brand-secondary"
                    href={`/users/${row.id}`}
                  >
                    {row.firstName} {row.lastName}
                  </Link>
                ),
              },
              {
                key: 'email',
                header: strings.ui.usersScreen.email,
                render: (row) => row.email,
              },
              {
                key: 'createdAt',
                header: strings.ui.usersScreen.created,
                render: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
            ]}
            rows={data.data}
          />
        )}
      </DataPanel>
    </Page>
  );
}
