'use client';

import Image from 'next/image';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { gentlePathPortalStrings as copy } from '@/strings';
import {
  useChildren,
  useJournals,
  usePortalOverview,
  useResources,
} from './hooks';
import { useJournalRemoval } from './useJournalRemoval';
import { CommercialServing } from '@/modules/commercial/components/CommercialServing';
import { WeeklyActivity } from './components/WeeklyActivity';
import { ResourceCard } from './components/ResourceCard';
import { JournalEntryCard } from './components/JournalEntryCard';
import { MutationError } from './components/MutationError';
import './styles/portal.css';

export function FamilyDashboardScreen() {
  const { session } = useSessionState();
  const overview = usePortalOverview();
  const journals = useJournals();
  const resources = useResources();
  const children = useChildren();
  const router = useRouter();
  const { mutation: remove, deleteEntry } = useJournalRemoval();
  return (
    <Page className="gp-portal-page gp-home">
      <PageHeader
        eyebrow={copy.home.eyebrow}
        title={copy.home.title(session?.user.firstName ?? '')}
        description={copy.home.description}
        action={
          <Button asChild>
            <Link href="/journal?new=true">
              <UiIcon name="plus" />
              {copy.home.newEntry}
            </Link>
          </Button>
        }
      />
      <QueryBoundary query={overview}>
        {(data) => (
          <>
            <section className="gp-home-tools">
              <div className="gp-portal-section-heading">
                <h2>{copy.home.toolsTitle}</h2>
              </div>
              <div className="gp-home-tools__grid">
                {[
                  {
                    label: copy.home.journals,
                    value: data.journalCount,
                    hint: copy.home.journalHint,
                    href: '/journal',
                    icon: 'file' as const,
                    tone: 'sage',
                  },
                  {
                    label: copy.home.saved,
                    value: data.savedCount,
                    hint: copy.home.savedHint,
                    href: '/saved',
                    icon: 'bookmark' as const,
                    tone: 'sunlight',
                  },
                  {
                    label: copy.home.observations,
                    value: data.observationCount,
                    hint: copy.home.observationHint,
                    href: '/milestones',
                    icon: 'leaf' as const,
                    tone: 'lilac',
                  },
                  {
                    label: copy.home.children,
                    value: data.childCount,
                    hint: copy.home.childHint,
                    href: '/family',
                    icon: 'user' as const,
                    tone: 'clay',
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className="gp-home-tool"
                    data-tone={item.tone}
                  >
                    <span className="gp-home-tool__icon" aria-hidden="true">
                      <UiIcon name={item.icon} />
                    </span>
                    <span className="gp-home-tool__count">{item.value}</span>
                    <span className="gp-home-tool__label">{item.label}</span>
                    <span className="gp-home-tool__hint">{item.hint}</span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="gp-home-hero">
              <div className="gp-home-hero__copy">
                <span className="gp-home-hero__eyebrow">
                  <UiIcon name="leaf" className="size-4" />
                  {copy.navigation.workspace}
                </span>
                <h2>{copy.home.heroTitle}</h2>
                <p>{copy.home.heroDescription}</p>
                <Button asChild>
                  <Link href="/resources">
                    {copy.home.heroAction}
                    <UiIcon name="arrowRight" />
                  </Link>
                </Button>
              </div>
              <div className="gp-home-hero__art">
                <Image
                  src="/gentlepath/path-landscape-v2.png"
                  alt={copy.home.heroAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, 55vw"
                  priority
                />
              </div>
            </section>
            <div className="gp-home-middle">
              <section className="grid content-start gap-5">
                <div className="gp-portal-section-heading">
                  <h2>{copy.home.recent}</h2>
                  <Button asChild variant="ghost">
                    <Link href="/journal">
                      {copy.common.viewAll}
                      <UiIcon name="arrowRight" className="size-4" />
                    </Link>
                  </Button>
                </div>
                <MutationError error={remove.error} />
                <QueryBoundary query={journals}>
                  {(entries) =>
                    entries.length ? (
                      <div className="gp-journal-preview-list">
                        {entries.slice(0, 3).map((entry) => (
                          <JournalEntryCard
                            key={entry.id}
                            entry={entry}
                            childrenProfiles={children.data ?? []}
                            href={`/journal?entry=${entry.id}`}
                            compact
                            headingLevel="h3"
                            removing={remove.isPending}
                            onEdit={() =>
                              router.push(`/journal?entry=${entry.id}`)
                            }
                            onDelete={() => void deleteEntry(entry)}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title={copy.home.noJournalTitle}
                        description={copy.home.noJournalHint}
                        action={
                          <Button asChild>
                            <Link href="/journal?new=true">
                              {copy.home.newEntry}
                            </Link>
                          </Button>
                        }
                      />
                    )
                  }
                </QueryBoundary>
              </section>
              <Card className="gp-week-card">
                <WeeklyActivity
                  values={data.weeklyActivity}
                  title={copy.home.week}
                  hint={copy.home.weekHint}
                />
              </Card>
            </div>
          </>
        )}
      </QueryBoundary>
      <section className="grid gap-5">
        <div className="gp-portal-section-heading">
          <h2>{copy.home.recommended}</h2>
          <Button asChild variant="ghost">
            <Link href="/resources">
              {copy.common.viewAll}
              <UiIcon name="arrowRight" className="size-4" />
            </Link>
          </Button>
        </div>
        <QueryBoundary query={resources}>
          {(items) =>
            items.length ? (
              <div className="gp-resource-grid">
                {items.slice(0, 3).map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    headingLevel="h3"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={copy.common.emptyTitle}
                description={copy.common.emptyHint}
              />
            )
          }
        </QueryBoundary>
      </section>
      <CommercialServing placementKey="HOME_CAROUSEL" />
      <blockquote className="gp-home-quote">
        <UiIcon name="leaf" />
        <p>{copy.home.quoteDescription}</p>
      </blockquote>
    </Page>
  );
}
