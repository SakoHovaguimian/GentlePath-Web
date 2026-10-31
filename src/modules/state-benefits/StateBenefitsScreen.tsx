'use client';

import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathStateBenefitsStrings as copy } from '@/strings';
import { StateBenefitImage } from './components/StateBenefitImage';
import { useFamilyPreferences } from '@/modules/onboarding/hooks';
import { useStateBenefits } from './hooks';

export function StateBenefitsScreen() {
  const preferences = useFamilyPreferences();
  const query = useStateBenefits();
  const edit = (
    <Button variant="secondary" asChild>
      <Link href={'/settings/family-preferences' as Route}>
        {copy.preferences}
      </Link>
    </Button>
  );
  return (
    <Page>
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={edit}
      />
      <p className="max-w-3xl text-sm text-tertiary">{copy.sampleNotice}</p>
      <QueryBoundary query={preferences}>
        {(settings) =>
          settings.state_code ? (
            <QueryBoundary query={query}>
              {(programs) =>
                programs.length ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {programs.map((program) => (
                      <Card key={program.id} className="flex flex-col gap-4">
                        <StateBenefitImage key={program.id} program={program} />
                        <div className="flex flex-wrap gap-2">
                          <Badge>{copy.sampleLabel}</Badge>
                          <Badge>{copy.categories[program.category]}</Badge>
                        </div>
                        <h2 className="text-xl font-semibold text-primary">
                          {program.name}
                        </h2>
                        <p className="grow text-sm text-tertiary">
                          {program.description}
                        </p>
                        <Button asChild variant="secondary">
                          <Link
                            href={
                              `/benefits/${encodeURIComponent(program.id)}` as Route
                            }
                          >
                            {copy.viewProgram}
                          </Link>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={copy.emptyTitle}
                    description={copy.emptyHint}
                  />
                )
              }
            </QueryBoundary>
          ) : (
            <EmptyState
              title={copy.noStateTitle}
              description={copy.noStateHint}
              action={edit}
            />
          )
        }
      </QueryBoundary>
    </Page>
  );
}
