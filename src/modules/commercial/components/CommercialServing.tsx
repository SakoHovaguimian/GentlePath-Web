'use client';
import { useState } from 'react';
import {
  Button,
  EmptyState,
  Field,
  Input,
  PageSection,
  QueryBoundary,
  Select,
} from '@/components/ui';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { AdPlacementKey } from '../models/adPlacement';
import { CommercialCarousel } from './CommercialCarousel';
import { useCommercialServing, useCommercialMutation } from '../hooks';
interface CommercialServingProps {
  placementKey?: AdPlacementKey;
  preview?: boolean;
}
export function CommercialServing({
  placementKey = 'FAMILY_DISCOUNTS_CAROUSEL',
  preview = false,
}: CommercialServingProps) {
  const [key, setKey] = useState(placementKey);
  const [locale, setLocale] = useState('en');
  const [localeDraft, setLocaleDraft] = useState('en');
  const [platform, setPlatform] = useState('WEB');
  const query = useCommercialServing(key, locale, platform);
  const { demoMode } = useRuntimeConfig();
  const { showToast } = usePresentationService();
  const ingest = useCommercialMutation((service, itemId: string) =>
    service.ingest({
      placement_item_id: itemId,
      metric_date: new Date().toISOString().slice(0, 10),
      locale,
      platform: platform as 'WEB',
      impressions: 1,
      clicks: 0,
      code_copies: 0,
    }),
  );
  return (
    <PageSection
      id={preview ? 'commercial-serving-preview' : 'commercial-sponsored'}
      title={preview ? copy.previewTitle : copy.sponsored}
      description={preview ? copy.previewHint : undefined}
    >
      {preview && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setLocale(localeDraft);
          }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Field labelText={copy.placementLabel}>
            <Select
              value={key}
              onValueChange={(value) => setKey(value as AdPlacementKey)}
            >
              {Object.entries(copy.placementKeys).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.platformLabel}>
            <Select value={platform} onValueChange={setPlatform}>
              {Object.entries(copy.platforms).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.locale}>
            <Input
              value={localeDraft}
              maxLength={64}
              onChange={(event) => setLocaleDraft(event.target.value)}
            />
          </Field>
          <Button type="submit" variant="secondary" className="self-end">
            {copy.applyFilters}
          </Button>
        </form>
      )}
      <MutationError error={ingest.error} />
      <QueryBoundary query={query}>
        {(placement) =>
          placement.items.length ? (
            <CommercialCarousel
              key={`${placement.id}-${placement.items.map((item) => item.id).join('-')}`}
              placement={placement}
              simulate={preview && demoMode}
              busy={ingest.isPending}
              onSimulate={async (id) => {
                try {
                  await ingest.mutateAsync(id);
                  void showToast({
                    title: copy.simulatedTitle,
                    intent: 'success',
                  });
                } catch {
                  /* Inline recovery. */
                }
              }}
            />
          ) : preview ? (
            <EmptyState
              title={copy.previewEmptyTitle}
              description={copy.previewEmptyHint}
            />
          ) : null
        }
      </QueryBoundary>
    </PageSection>
  );
}
