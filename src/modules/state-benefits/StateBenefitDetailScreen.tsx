'use client';

import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Button,
  Card,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathStateBenefitsStrings as copy } from '@/strings';
import { StateBenefitImage } from './components/StateBenefitImage';
import { useFamilyPreferences } from '@/modules/onboarding/hooks';
import { useStateBenefit } from './hooks';

export function StateBenefitDetailScreen({ id }: { id: string }) {
  const preferences = useFamilyPreferences();
  const query = useStateBenefit(id);
  return (
    <QueryBoundary query={preferences}>
      {() => (
        <QueryBoundary query={query}>
          {(program) => (
            <Page>
              <div>
                <Button asChild variant="secondary">
                  <Link href={'/benefits' as Route}>{copy.back}</Link>
                </Button>
              </div>
              <PageHeader
                title={program.name}
                description={program.description}
                meta={
                  <>
                    <Badge>{copy.sampleLabel}</Badge>
                    <Badge>{copy.categories[program.category]}</Badge>
                  </>
                }
              />
              <div className="max-w-4xl">
                <StateBenefitImage key={program.id} program={program} />
              </div>
              <p className="max-w-3xl text-sm text-tertiary">
                {copy.sampleNotice}
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <h2 className="mb-4 text-lg font-semibold text-primary">
                    {copy.benefits}
                  </h2>
                  <ul className="grid list-disc gap-3 pl-5 text-sm text-secondary">
                    {program.benefits.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <h2 className="mb-4 text-lg font-semibold text-primary">
                    {copy.qualifications}
                  </h2>
                  <ul className="grid list-disc gap-3 pl-5 text-sm text-secondary">
                    {program.qualifications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Card>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a
                    href={program.program_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.visitProgram}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <Link
                    href={
                      `/applications/new?program=${encodeURIComponent(program.id)}` as Route
                    }
                  >
                    {copy.trackApplication}
                  </Link>
                </Button>
              </div>
            </Page>
          )}
        </QueryBoundary>
      )}
    </QueryBoundary>
  );
}
