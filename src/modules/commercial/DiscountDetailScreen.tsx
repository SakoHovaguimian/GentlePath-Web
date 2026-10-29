'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  DescriptionList,
  Message,
  Page,
  PageHeader,
  PageSection,
  QueryBoundary,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { useDiscountOffer } from './hooks';
export function DiscountDetailScreen({ id }: { id: string }) {
  const query = useDiscountOffer(id);
  const [copyError, setCopyError] = useState(false);
  const { showToast } = usePresentationService();
  return (
    <Page>
      <QueryBoundary query={query}>
        {(offer) => (
          <>
            <PageHeader
              title={offer.title}
              description={offer.description}
              eyebrow={copy.categories[offer.category]}
              breadcrumbs={[
                { label: copy.discountsTitle, href: '/discounts' },
                { label: offer.title },
              ]}
              meta={
                <>
                  <Badge intent="warning">{copy.sponsored}</Badge>
                  <Badge intent="success">{copy.verified}</Badge>
                  <span>{offer.sponsor?.name}</span>
                </>
              }
            />
            <Card className="grid gap-5">
              <p className="m-0 font-display text-2xl text-primary">
                {offer.discount_label}
              </p>
              <p className="m-0 text-sm text-secondary">
                {offer.disclosure_label}
              </p>
              {offer.affiliate_disclosure && (
                <p className="m-0 text-sm text-secondary">
                  {offer.affiliate_disclosure}
                </p>
              )}
              {offer.code && (
                <div className="flex flex-wrap items-center gap-3">
                  <code className="rounded-lg border border-secondary bg-secondary_subtle px-4 py-3 text-base text-primary">
                    {offer.code}
                  </code>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(offer.code!);
                        setCopyError(false);
                        void showToast({
                          title: copy.copiedTitle,
                          intent: 'success',
                        });
                      } catch {
                        setCopyError(true);
                      }
                    }}
                  >
                    {copy.copyCode}
                  </Button>
                </div>
              )}
              {copyError && (
                <Message
                  title={copy.errorTitle}
                  description={copy.copyErrorHint}
                  intent="danger"
                />
              )}
              <Button asChild className="justify-self-start">
                <a
                  href={offer.landing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.visit}
                </a>
              </Button>
            </Card>
            <PageSection id="offer-provenance" title={copy.provenanceTitle}>
              <Card className="grid gap-5">
                <DescriptionList
                  items={[
                    {
                      label: copy.starts_at,
                      value: new Date(offer.starts_at).toLocaleString('en-US'),
                    },
                    {
                      label: copy.expires_at,
                      value: new Date(offer.expires_at).toLocaleString('en-US'),
                    },
                    {
                      label: copy.verifiedAt,
                      value: offer.verified_at
                        ? new Date(offer.verified_at).toLocaleString('en-US')
                        : copy.none,
                    },
                    {
                      label: copy.verificationUntil,
                      value: offer.verification_valid_until
                        ? new Date(
                            offer.verification_valid_until,
                          ).toLocaleString('en-US')
                        : copy.none,
                    },
                  ]}
                />
                {offer.verification_source_url && (
                  <a
                    href={offer.verification_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-brand-secondary underline underline-offset-4 hover:text-primary"
                  >
                    {copy.source}
                  </a>
                )}
                <p className="m-0 whitespace-pre-wrap text-sm text-secondary">
                  {offer.terms_text}
                </p>
              </Card>
            </PageSection>
            <Button asChild variant="secondary" className="justify-self-start">
              <Link href="/discounts">{copy.backDiscounts}</Link>
            </Button>
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
