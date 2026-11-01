'use client';

import { Button, NavigationLink, QueryBoundary, UiIcon } from '@/components/ui';
import { gentlePathApplicationStrings as copy } from '@/strings';
import { useChildren } from '@/modules/portal/hooks';
import { useApplicationDashboard } from '../hooks';
import { ApplicationCard } from './ApplicationCard';
import '../styles/applications.css';

export function ApplicationDashboard() {
  const query = useApplicationDashboard();
  const children = useChildren();
  return (
    <QueryBoundary query={query}>
      {(applications) =>
        applications.length ? (
          <section
            className="gp-application-dashboard__section"
            aria-labelledby="dashboard-applications-heading"
          >
            <div className="gp-portal-section-heading">
              <div>
                <h2 id="dashboard-applications-heading">
                  {copy.dashboardTitle}
                </h2>
                <p className="gp-application-dashboard__description">
                  {copy.dashboardDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="ghost">
                  <NavigationLink href="/applications">
                    {copy.backAction}
                  </NavigationLink>
                </Button>
                <Button asChild variant="secondary">
                  <NavigationLink href="/applications/follow-ups">
                    {copy.allFollowUpsAction}
                    <UiIcon name="arrowRight" className="size-4" />
                  </NavigationLink>
                </Button>
              </div>
            </div>
            <div className="gp-application-dashboard__grid">
              {applications.map(({ application, followUp }) => (
                <ApplicationCard
                  key={followUp?.id ?? application.id}
                  application={application}
                  followUp={followUp}
                  completable={Boolean(followUp)}
                  childName={
                    children.data?.find(
                      (child) => child.id === application.child_id,
                    )?.name
                  }
                  compact
                />
              ))}
            </div>
          </section>
        ) : null
      }
    </QueryBoundary>
  );
}
