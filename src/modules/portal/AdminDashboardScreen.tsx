'use client';

import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  MetricCard,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { canManagePlatform } from '@/services/auth/permissions';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useAdminOverview } from './adminHooks';
import { WeeklyActivity } from './components/WeeklyActivity';

export function AdminDashboardScreen() {
  const { session } = useSessionState();
  const superadmin = session && canManagePlatform(session.user.role);
  const query = useAdminOverview();
  return (
    <div className="grid gap-7">
      <PageHeader
        title={superadmin ? copy.admin.superTitle : copy.admin.title}
        description={copy.admin.description}
        eyebrow={
          superadmin
            ? copy.navigation.role.superadmin
            : copy.navigation.role.admin
        }
        action={
          <Button asChild>
            <Link href="/admin/blog/new">
              <UiIcon name="plus" />
              {copy.admin.create}
            </Link>
          </Button>
        }
      />
      <QueryBoundary query={query}>
        {(data) => (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                eyebrow={copy.admin.users}
                value={String(data.userCount)}
                caption={copy.admin.usersHint}
                icon={<UiIcon name="user" />}
              />
              <MetricCard
                eyebrow={copy.admin.active}
                value={String(data.activeUserCount)}
                caption={copy.admin.activeHint}
                icon={<UiIcon name="check" />}
              />
              <MetricCard
                eyebrow={copy.admin.published}
                value={String(data.publishedBlogCount)}
                caption={copy.admin.publishedHint}
                icon={<UiIcon name="file" />}
              />
              <MetricCard
                eyebrow={copy.admin.reports}
                value={String(data.openReportCount)}
                caption={copy.admin.reportsHint}
                icon={<UiIcon name="warning" />}
              />
            </section>
            <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
              <Card className="p-6">
                <WeeklyActivity
                  values={data.weeklyRegistrations}
                  title={copy.admin.growth}
                  hint={copy.admin.growthHint}
                />
              </Card>
              <Card className="grid content-start gap-5 p-6">
                <h2 className="m-0 font-display text-xl">
                  {copy.admin.roleBreakdown}
                </h2>
                {Object.entries(data.roleCounts).map(([role, count]) => (
                  <div key={role} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span>
                        {
                          copy.navigation.role[
                            role as keyof typeof data.roleCounts
                          ]
                        }
                      </span>
                      <strong className="font-medium tabular-nums">
                        {count}
                      </strong>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-brand-solid/70"
                        style={{
                          width: `${(count / Math.max(1, data.userCount)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
            <section className="grid gap-5 md:grid-cols-2">
              <Card className="grid content-start gap-4 p-6">
                <UiIcon name="file" className="size-7 text-brand-secondary" />
                <h2 className="m-0 font-display text-2xl">
                  {copy.admin.content}
                </h2>
                <p className="m-0 text-sm leading-7 text-secondary">
                  {copy.admin.contentHint}
                </p>
                <Badge className="justify-self-start">
                  {copy.admin.drafts(data.draftBlogCount)}
                </Badge>
                <Button
                  asChild
                  variant="secondary"
                  className="mt-2 justify-self-start"
                >
                  <Link href="/admin/blog">
                    {copy.navigation.publishing}
                    <UiIcon name="arrowRight" />
                  </Link>
                </Button>
              </Card>
              <Card className="grid content-start gap-4 p-6">
                <UiIcon name="lock" className="size-7 text-brand-secondary" />
                <h2 className="m-0 font-display text-2xl">
                  {copy.admin.moderation}
                </h2>
                <p className="m-0 text-sm leading-7 text-secondary">
                  {copy.admin.moderationHint}
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="mt-2 justify-self-start"
                >
                  <Link href="/admin/moderation">
                    {copy.admin.review}
                    <UiIcon name="arrowRight" />
                  </Link>
                </Button>
              </Card>
            </section>
            {superadmin && (
              <Card className="flex flex-wrap items-center justify-between gap-5 bg-brand-primary p-6">
                <div className="grid gap-2">
                  <h2 className="m-0 font-display text-xl">
                    {copy.admin.settings}
                  </h2>
                  <p className="m-0 text-sm text-secondary">
                    {copy.admin.settingsHint}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/admin/settings">
                    {copy.admin.configure}
                    <UiIcon name="settings" />
                  </Link>
                </Button>
              </Card>
            )}
          </>
        )}
      </QueryBoundary>
      <aside className="flex items-start gap-3 rounded-2xl border border-secondary p-5">
        <UiIcon name="lock" className="mt-0.5 shrink-0 text-brand-secondary" />
        <div>
          <h2 className="m-0 text-sm font-medium">{copy.admin.privacyTitle}</h2>
          <p className="mt-1 mb-0 text-sm leading-6 text-secondary">
            {copy.admin.privacyHint}
          </p>
        </div>
      </aside>
    </div>
  );
}
