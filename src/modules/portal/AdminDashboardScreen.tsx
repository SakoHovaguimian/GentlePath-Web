'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import styles from './Admin.module.css';

export function AdminDashboardScreen() {
  const { session } = useSessionState();
  const superadmin = session && canManagePlatform(session.user.role);
  const query = useAdminOverview();
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBody}>
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
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            src="/gentlepath/path-landscape-v2.png"
            alt={copy.common.decorativeAlt}
            fill
            sizes="(max-width: 540px) 100vw, (max-width: 1024px) 42vw, 34vw"
            preload
          />
        </div>
      </section>
      <QueryBoundary query={query}>
        {(data) => (
          <>
            <section className={styles.metrics}>
              <div className={styles.metric} data-tone="sage">
                <MetricCard
                  eyebrow={copy.admin.users}
                  value={String(data.userCount)}
                  caption={copy.admin.usersHint}
                  icon={<UiIcon name="user" />}
                />
              </div>
              <div className={styles.metric} data-tone="lilac">
                <MetricCard
                  eyebrow={copy.admin.active}
                  value={String(data.activeUserCount)}
                  caption={copy.admin.activeHint}
                  icon={<UiIcon name="check" />}
                />
              </div>
              <div className={styles.metric} data-tone="sunlight">
                <MetricCard
                  eyebrow={copy.admin.published}
                  value={String(data.publishedBlogCount)}
                  caption={copy.admin.publishedHint}
                  icon={<UiIcon name="file" />}
                />
              </div>
              <div className={styles.metric} data-tone="clay">
                <MetricCard
                  eyebrow={copy.admin.reports}
                  value={String(data.openReportCount)}
                  caption={copy.admin.reportsHint}
                  icon={<UiIcon name="warning" />}
                />
              </div>
            </section>
            <div className={styles.insights}>
              <Card className={styles.chartPanel}>
                <WeeklyActivity
                  values={data.weeklyRegistrations}
                  title={copy.admin.growth}
                  hint={copy.admin.growthHint}
                />
              </Card>
              <Card className={styles.rolesPanel}>
                <div className={styles.panelHeading}>
                  <span className={styles.roundIcon} data-tone="lilac">
                    <UiIcon name="user" />
                  </span>
                  <h2>{copy.admin.roleBreakdown}</h2>
                </div>
                {Object.entries(data.roleCounts).map(([role, count]) => (
                  <div key={role} className={styles.role} data-role={role}>
                    <div className={styles.roleLabel}>
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
                    <div className={styles.roleTrack}>
                      <div
                        className={styles.roleFill}
                        style={{
                          width: `${(count / Math.max(1, data.userCount)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
            <section className={styles.workAreas}>
              <Card className={styles.workCard}>
                <div className={styles.workCardTop}>
                  <span className={styles.roundIcon} data-tone="lilac">
                    <UiIcon name="file" />
                  </span>
                  <Badge>{copy.admin.drafts(data.draftBlogCount)}</Badge>
                </div>
                <h2>{copy.admin.content}</h2>
                <p>{copy.admin.contentHint}</p>
                <Button asChild variant="secondary">
                  <Link href="/admin/blog">
                    {copy.navigation.publishing}
                    <UiIcon name="arrowRight" />
                  </Link>
                </Button>
              </Card>
              <Card className={styles.workCard} data-tone="sage">
                <span className={styles.roundIcon}>
                  <UiIcon name="checklist" />
                </span>
                <h2>{copy.admin.moderation}</h2>
                <p>{copy.admin.moderationHint}</p>
                <Button asChild variant="secondary">
                  <Link href="/admin/moderation">
                    {copy.admin.review}
                    <UiIcon name="arrowRight" />
                  </Link>
                </Button>
              </Card>
            </section>
            {superadmin && (
              <Card className={styles.platformStrip}>
                <div>
                  <h2>{copy.admin.settings}</h2>
                  <p>{copy.admin.settingsHint}</p>
                </div>
                <Button asChild variant="secondary">
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
      <aside className={styles.privacyNote}>
        <div>
          <h2>{copy.admin.privacyTitle}</h2>
          <p>{copy.admin.privacyHint}</p>
        </div>
      </aside>
    </div>
  );
}
