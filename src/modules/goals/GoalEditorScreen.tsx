'use client';
import {
  buttonClassName,
  Button,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathGoalStrings as copy } from '@/strings';
import { useChildren } from '@/modules/portal/hooks';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useGoal } from './hooks';
import { GoalEditor } from './components/GoalEditor';
import { goalUnavailable } from './services/goalUnavailable';
import '@/modules/portal/styles/portal.css';

export function GoalEditorScreen({ id }: { id?: string }) {
  const children = useChildren();
  const query = useGoal(id ?? '');
  const header = (
    <PageHeader
      title={id ? copy.editGoal : copy.newGoal}
      description={copy.private}
    />
  );
  if (!children.data || goalUnavailable(children.error))
    return (
      <Page className="gp-portal-page">
        {header}
        <QueryBoundary query={children}>{() => null}</QueryBoundary>
      </Page>
    );
  if (!children.data.length)
    return (
      <Page className="gp-portal-page">
        {header}
        <EmptyState
          title={copy.noChildrenTitle}
          description={copy.noChildrenDescription}
          action={
            <NavigationLink href="/family" className={buttonClassName()}>
              {copy.manageChildren}
            </NavigationLink>
          }
        />
      </Page>
    );
  if (id && (!query.data || goalUnavailable(query.error)))
    return (
      <Page className="gp-portal-page">
        {header}
        <QueryBoundary query={query}>{() => null}</QueryBoundary>
      </Page>
    );
  return (
    <Page className="gp-portal-page">
      {header}
      <MutationError error={children.error || query.error} />
      {(children.error || query.error) && (
        <Button
          variant="secondary"
          onClick={() => {
            void children.refetch();
            if (id) void query.refetch();
          }}
        >
          {copy.retry}
        </Button>
      )}
      <GoalEditor
        goal={id ? query.data : undefined}
        childrenProfiles={children.data}
      />
    </Page>
  );
}
