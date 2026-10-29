'use client';

import Image from 'next/image';
import type { Route } from 'next';
import Link from 'next/link';
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useJournals, usePortalOverview, useResources } from './hooks';
import { WeeklyActivity } from './components/WeeklyActivity';
import { ResourceCard } from './components/ResourceCard';

export function FamilyDashboardScreen() {
  const { session } = useSessionState();
  const overview = usePortalOverview();
  const journals = useJournals();
  const resources = useResources();
  return (
    <div className="grid gap-8">
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
      <section className="relative grid overflow-hidden rounded-3xl border border-secondary bg-brand-primary md:grid-cols-[1.2fr_1fr]">
        <div className="relative z-10 flex flex-col items-start justify-center gap-4 p-7 lg:p-10">
          <span className="text-xs font-semibold tracking-widest text-brand-secondary">
            {copy.navigation.workspace}
          </span>
          <h2 className="m-0 max-w-md font-display text-3xl leading-tight text-primary lg:text-4xl">
            {copy.home.heroTitle}
          </h2>
          <p className="m-0 max-w-md text-sm leading-7 text-secondary">
            {copy.home.heroDescription}
          </p>
          <Button asChild variant="secondary" className="mt-1">
            <Link href="/resources">
              {copy.home.heroAction}
              <UiIcon name="arrowRight" />
            </Link>
          </Button>
        </div>
        <div className="flex h-64 items-center justify-center md:h-auto">
          <Image
            src="/gentlepath/winding-path.png"
            alt={copy.home.heroAlt}
            width={360}
            height={360}
            priority
            className="h-full max-h-80 w-full object-contain"
          />
        </div>
      </section>
      <QueryBoundary query={overview}>
        {(data) => (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: copy.home.journals,
                  value: data.journalCount,
                  hint: copy.home.journalHint,
                  href: '/journal',
                  icon: 'file' as const,
                },
                {
                  label: copy.home.saved,
                  value: data.savedCount,
                  hint: copy.home.savedHint,
                  href: '/saved',
                  icon: 'layers' as const,
                },
                {
                  label: copy.home.observations,
                  value: data.observationCount,
                  hint: copy.home.observationHint,
                  href: '/milestones',
                  icon: 'leaf' as const,
                },
                {
                  label: copy.home.children,
                  value: data.childCount,
                  hint: copy.home.childHint,
                  href: '/family',
                  icon: 'user' as const,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className="grid gap-3 rounded-2xl border border-secondary bg-primary p-5 transition-colors hover:bg-secondary_subtle focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <div className="flex items-center justify-between gap-3 text-sm text-secondary">
                    {item.label}
                    <UiIcon
                      name={item.icon}
                      className="size-4 text-brand-secondary"
                    />
                  </div>
                  <span className="font-display text-3xl text-primary tabular-nums">
                    {item.value}
                  </span>
                  <span className="text-xs text-tertiary">{item.hint}</span>
                </Link>
              ))}
            </section>
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section className="grid content-start gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="m-0 font-display text-xl">
                    {copy.home.recent}
                  </h2>
                  <Button asChild variant="ghost">
                    <Link href="/journal">
                      {copy.common.viewAll}
                      <UiIcon name="arrowRight" className="size-4" />
                    </Link>
                  </Button>
                </div>
                <QueryBoundary query={journals}>
                  {(entries) =>
                    entries.length ? (
                      <div className="divide-y divide-secondary rounded-2xl border border-secondary bg-primary">
                        {entries.slice(0, 3).map((entry) => (
                          <Link
                            href={`/journal?entry=${entry.id}`}
                            key={entry.id}
                            className="flex items-start justify-between gap-4 px-5 py-5 hover:bg-secondary_subtle focus-visible:outline-2 focus-visible:outline-brand"
                          >
                            <div className="grid min-w-0 gap-2">
                              <span className="text-xs text-tertiary">
                                {new Date(entry.createdAt).toLocaleDateString(
                                  'en-US',
                                  { month: 'short', day: 'numeric' },
                                )}
                              </span>
                              <h3 className="m-0 font-medium text-primary">
                                {entry.title}
                              </h3>
                              <p className="m-0 line-clamp-1 text-sm text-secondary">
                                {entry.body}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-brand-primary px-3 py-1 text-xs text-brand-secondary">
                              {copy.journal.emotions[entry.emotion]}
                            </span>
                          </Link>
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
              <Card className="p-6">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-xl">{copy.home.recommended}</h2>
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
              <div className="grid gap-5 md:grid-cols-3">
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
      <p className="m-0 py-2 text-center font-display text-sm italic text-tertiary">
        {copy.home.quoteDescription}
      </p>
    </div>
  );
}
