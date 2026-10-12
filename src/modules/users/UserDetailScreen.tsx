'use client';

import { strings } from '@/strings';
import { Card, EmptyState, ErrorState } from '@/components/ui';
import { useUser } from './hooks';

export function UserDetailScreen({ userId }: { userId: string }) {
  const { data, isPending, isError, refetch } = useUser(userId);

  if (isPending) {
    return <Card>{strings.ui.userDetailScreen.loadingUserProfile}</Card>;
  }

  if (isError) {
    return (
      <ErrorState
        title={strings.ui.userDetailScreen.userUnavailable}
        description={strings.ui.userDetailScreen.weCouldNotLoadThisUserProfile}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title={strings.ui.userDetailScreen.missingUser}
        description={strings.ui.userDetailScreen.thisUserRecordCouldNotBeFound}
      />
    );
  }

  return (
    <Card className="grid gap-4">
      <div className="grid gap-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
          {strings.ui.userDetailScreen.userDetail}
        </p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-primary">
          {data.firstName} {data.lastName}
        </h1>
      </div>
      <div className="grid gap-3 rounded-xl border border-secondary bg-secondary_subtle p-4 text-sm text-secondary">
        <p className="m-0">
          <span className="font-semibold text-primary">
            {strings.ui.userDetailScreen.email}
          </span>{' '}
          {data.email}
        </p>
        <p className="m-0">
          <span className="font-semibold text-primary">
            {strings.ui.userDetailScreen.externalId}
          </span>{' '}
          {data.externalId}
        </p>
        <p className="m-0">
          <span className="font-semibold text-primary">
            {strings.ui.userDetailScreen.created}
          </span>{' '}
          {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>
    </Card>
  );
}
