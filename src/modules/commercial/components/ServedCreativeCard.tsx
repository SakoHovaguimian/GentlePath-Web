'use client';
import Image from 'next/image';
import { Badge, Button, Card, FormSection } from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { AdPlacementItemPublic } from '../models/adPlacementItem';
import { CreativeAction } from './CreativeAction';
interface ServedCreativeCardProps {
  item: AdPlacementItemPublic;
  simulate?: boolean;
  busy: boolean;
  onSimulate: (id: string) => void;
}
export function ServedCreativeCard({
  item,
  simulate,
  busy,
  onSimulate,
}: ServedCreativeCardProps) {
  const creative = item.creative;
  if (!creative) return null;
  return (
    <Card className="grid content-start gap-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Badge intent="warning">{copy.sponsored}</Badge>
        <span className="text-xs text-tertiary">{creative.sponsor?.name}</span>
      </div>
      <div
        className="grid gap-4 rounded-xl bg-secondary_subtle p-4"
        style={{ backgroundColor: creative.background_color ?? undefined }}
      >
        {creative.image_url && (
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={creative.image_url}
              alt={creative.image_alt_text ?? ''}
              fill
              unoptimized
              sizes="(max-width: 1023px) 100vw, 40vw"
              className={
                creative.image_fit === 'CONTAIN'
                  ? 'object-contain'
                  : 'object-cover'
              }
            />
          </div>
        )}
        <h3
          className="m-0 font-display text-xl font-normal text-primary wrap-anywhere"
          style={{ color: creative.title_color ?? undefined }}
        >
          {creative.title}
        </h3>
        {creative.subtitle && (
          <p
            className="m-0 text-sm text-secondary"
            style={{ color: creative.subtitle_color ?? undefined }}
          >
            {creative.subtitle}
          </p>
        )}
      </div>
      <p className="m-0 text-sm text-secondary">{creative.disclosure_label}</p>
      {creative.affiliate_disclosure && (
        <p className="m-0 text-sm text-secondary">
          {creative.affiliate_disclosure}
        </p>
      )}
      <CreativeAction creative={creative} />
      {simulate && (
        <FormSection
          id={`simulate-${item.id}`}
          title={copy.simulate}
          description={copy.simulateHint}
        >
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onSimulate(item.id)}
          >
            {copy.simulate}
          </Button>
        </FormSection>
      )}
    </Card>
  );
}
