import Link from 'next/link';
import { Badge, Button, Card } from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { DiscountOfferPublic } from '../models/discountOffer';
export function OfferCard({ offer }: { offer: DiscountOfferPublic }) {
  return (
    <Card className="grid h-full content-start gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge intent="warning">{copy.sponsored}</Badge>
        <Badge intent="success">{copy.verified}</Badge>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-xs text-tertiary">
          {offer.sponsor?.name ?? copy.sponsor}
        </p>
        <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere">
          {offer.title}
        </h2>
        <p className="m-0 text-sm text-secondary">{offer.description}</p>
      </div>
      <p className="m-0 text-lg font-semibold text-brand-secondary">
        {offer.discount_label}
      </p>
      <p className="m-0 text-xs text-tertiary">{offer.disclosure_label}</p>
      <Button asChild variant="secondary" className="mt-auto">
        <Link href={`/discounts/${offer.id}`}>{copy.viewOffer}</Link>
      </Button>
    </Card>
  );
}
