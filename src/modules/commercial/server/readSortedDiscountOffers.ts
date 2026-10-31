import 'server-only';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { BackendForward } from '@/services/api/models/backendForward';
import { DiscountSortSchema } from '../models/discountSort';
import {
  DiscountOfferPublicSchema,
  type DiscountOfferPublic,
} from '../models/discountOffer';
import { commercialPageSchema } from '../models/commercialDirectory';
import { sortDiscountOffers } from '../services/sortDiscountOffers';

/** The upstream has a fixed newest-first order, so alternate orders collect its complete public catalogue. */
export async function readSortedDiscountOffers(
  request: Request,
  params: URLSearchParams,
  forward: BackendForward,
) {
  const parsed = DiscountSortSchema.safeParse(params.get('sort') ?? 'latest');
  const limit = Number(params.get('limit') ?? 12);
  const offset = Number(params.get('offset') ?? 0);
  if (
    !parsed.success ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger(offset) ||
    offset < 0
  )
    throw new ValidationError(copy.validation.invalid);
  const upstream = new URLSearchParams(params);
  upstream.delete('sort');
  if (parsed.data === 'latest')
    return forward(request, `/discount-offers?${upstream}`);
  const records: DiscountOfferPublic[] = [];
  const seen = new Set<string>();
  let cursor = 0;
  for (let pageIndex = 0; pageIndex < 1000; pageIndex++) {
    request.signal.throwIfAborted();
    upstream.set('limit', '100');
    upstream.set('offset', String(cursor));
    const response = await forward(request, `/discount-offers?${upstream}`);
    if (!response.ok) return response;
    const page = commercialPageSchema(DiscountOfferPublicSchema).parse(
      await response.json(),
    );
    for (const record of page.data) {
      if (seen.has(record.id))
        throw new ValidationError(copy.validation.directory);
      seen.add(record.id);
      records.push(record);
    }
    if (!page.page.hasMore) {
      const sorted = sortDiscountOffers(records, parsed.data);
      const hasMore = offset + limit < sorted.length;
      return Response.json(
        {
          data: sorted.slice(offset, offset + limit),
          page: {
            limit,
            offset,
            hasMore,
            nextOffset: hasMore ? offset + limit : null,
          },
        },
        { headers: { 'cache-control': 'no-store' } },
      );
    }
    if (
      page.page.nextOffset === null ||
      page.page.nextOffset <= cursor ||
      !page.data.length
    )
      break;
    cursor = page.page.nextOffset;
  }
  throw new ValidationError(copy.validation.directory);
}
