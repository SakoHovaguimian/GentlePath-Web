import { z } from 'zod';
import {
  CommercialAppRouteSchema,
  CommercialDestinationSchema,
} from '../models/commercialDestination';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import {
  commercialSchemas,
  commercialCreateSchemas,
  commercialUpdateSchemas,
  type CommercialEntity,
  type CommercialRecords,
} from '../models/commercialEntity';
import {
  commercialPageSchema,
  type CommercialFilters,
  type CommercialPage,
} from '../models/commercialDirectory';
import { DiscountOfferPublicSchema } from '../models/discountOffer';
import {
  AdPlacementPublicSchema,
  type AdPlacementKey,
} from '../models/adPlacement';
import {
  AdPlacementItemsSchema,
  AdPlacementOrderSchema,
  type AdPlacementItemInput,
} from '../models/adPlacementItem';
import { CommercialReviewSchema } from '../models/commercialReview';
import { SponsorReviewSchema } from '../models/sponsorReview';
import { CommercialEnablementSchema } from '../models/commercialEnablement';
import {
  DiscountOfferVerificationSchema,
  type DiscountOfferVerification,
} from '../models/discountOfferVerification';
import { AdDailyMetricSchema } from '../models/adDailyMetric';
import {
  AdMetricIngestSchema,
  type AdMetricIngest,
} from '../models/adMetricIngest';

function query(filters: CommercialFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.size ? `?${params}` : '';
}
const base = '/admin/commercial';
export class CommercialService {
  constructor(private readonly api: ApiClientInterface) {}
  async list<K extends CommercialEntity>(
    entity: K,
    filters: CommercialFilters = {},
    signal?: AbortSignal,
  ): Promise<CommercialPage<CommercialRecords[K]>> {
    return commercialPageSchema(commercialSchemas[entity]).parse(
      await this.api.request(
        `${base}/${entity}${query({ limit: 25, ...filters })}`,
        { signal },
      ),
    ) as CommercialPage<CommercialRecords[K]>;
  }
  async detail<K extends CommercialEntity>(
    entity: K,
    id: string,
    signal?: AbortSignal,
  ): Promise<CommercialRecords[K]> {
    return commercialSchemas[entity].parse(
      await this.api.request(`${base}/${entity}/${encodeURIComponent(id)}`, {
        signal,
      }),
    ) as CommercialRecords[K];
  }
  async save<K extends CommercialEntity>(
    entity: K,
    input: unknown,
    id?: string,
  ): Promise<CommercialRecords[K]> {
    const schema: z.ZodType = id
      ? commercialUpdateSchemas[entity]
      : commercialCreateSchemas[entity];
    return commercialSchemas[entity].parse(
      await this.api.request(
        `${base}/${entity}${id ? `/${encodeURIComponent(id)}` : ''}`,
        { method: id ? 'PUT' : 'POST', body: validateInput(schema, input) },
      ),
    ) as CommercialRecords[K];
  }
  async remove(entity: CommercialEntity, id: string) {
    await this.api.request(`${base}/${entity}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async review(
    entity: Exclude<CommercialEntity, 'placements'>,
    id: string,
    decision: string,
    notes: string | null,
  ) {
    const body =
      entity === 'sponsors'
        ? validateInput(SponsorReviewSchema, {
            status: decision,
            review_notes: notes,
          })
        : validateInput(CommercialReviewSchema, {
            review_status: decision,
            review_notes: notes,
          });
    return commercialSchemas[entity].parse(
      await this.api.request(
        `${base}/${entity}/${encodeURIComponent(id)}/review`,
        { method: 'PATCH', body },
      ),
    );
  }
  async enable(
    entity: 'offers' | 'campaigns' | 'creatives',
    id: string,
    enabled: boolean,
  ) {
    return commercialSchemas[entity].parse(
      await this.api.request(
        `${base}/${entity}/${encodeURIComponent(id)}/enablement`,
        {
          method: 'PATCH',
          body: validateInput(CommercialEnablementSchema, {
            is_enabled: enabled,
          }),
        },
      ),
    );
  }
  async verify(id: string, input: DiscountOfferVerification) {
    return commercialSchemas.offers.parse(
      await this.api.request(
        `${base}/offers/${encodeURIComponent(id)}/verification`,
        {
          method: 'PATCH',
          body: validateInput(DiscountOfferVerificationSchema, input),
        },
      ),
    );
  }
  async replaceItems(id: string, items: AdPlacementItemInput[]) {
    return commercialSchemas.placements.parse(
      await this.api.request(
        `${base}/placements/${encodeURIComponent(id)}/items`,
        {
          method: 'PUT',
          body: validateInput(AdPlacementItemsSchema, { items }),
        },
      ),
    );
  }
  async reorderItems(id: string, itemIds: string[]) {
    return commercialSchemas.placements.parse(
      await this.api.request(
        `${base}/placements/${encodeURIComponent(id)}/items/order`,
        {
          method: 'PUT',
          body: validateInput(AdPlacementOrderSchema, { item_ids: itemIds }),
        },
      ),
    );
  }
  async offers(filters: CommercialFilters = {}, signal?: AbortSignal) {
    return commercialPageSchema(DiscountOfferPublicSchema).parse(
      await this.api.request(
        `/portal/commercial/offers${query({ limit: 12, ...filters })}`,
        { signal },
      ),
    );
  }
  async offer(id: string, signal?: AbortSignal) {
    return DiscountOfferPublicSchema.parse(
      await this.api.request(
        `/portal/commercial/offers/${encodeURIComponent(id)}`,
        { signal },
      ),
    );
  }
  async serve(
    key: AdPlacementKey,
    locale = 'en',
    platform = 'WEB',
    signal?: AbortSignal,
  ) {
    return AdPlacementPublicSchema.parse(
      await this.api.request(
        `/portal/commercial/placements/key/${encodeURIComponent(key)}${query({ locale, platform })}`,
        { signal },
      ),
    );
  }
  async metrics(filters: CommercialFilters = {}, signal?: AbortSignal) {
    return commercialPageSchema(AdDailyMetricSchema).parse(
      await this.api.request(
        `${base}/metrics${query({ limit: 25, ...filters })}`,
        { signal },
      ),
    );
  }
  async destination(route: string, signal?: AbortSignal) {
    return CommercialDestinationSchema.parse(
      await this.api.request(
        `/portal/commercial/destination${query({ route: validateInput(CommercialAppRouteSchema, route) })}`,
        { signal },
      ),
    );
  }
  async ingest(input: AdMetricIngest) {
    return z.object({ accepted: z.literal(true) }).parse(
      await this.api.request('/portal/commercial/metrics', {
        method: 'POST',
        body: validateInput(AdMetricIngestSchema, input),
      }),
    );
  }
}
