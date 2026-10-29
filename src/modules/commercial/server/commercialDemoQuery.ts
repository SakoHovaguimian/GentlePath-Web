import 'server-only';
import { z } from 'zod';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathCommercialStrings as copy } from '@/strings';
import {
  AdLocaleSchema,
  AdPlatformSchema,
  AdActionTypeSchema,
  AdLayoutSchema,
} from '../models/adCreative';
import { AdPlacementKeySchema } from '../models/adPlacement';
import { DiscountCategorySchema } from '../models/discountOffer';
import { CommercialRelationshipSchema } from '../models/commercialRelationship';
import type { DemoCommercialState } from './demoCommercialState';
const common = ['query', 'limit', 'offset', 'created_after', 'created_before'];
const fields: Record<string, string[]> = {
  sponsors: [
    'id',
    'status',
    'contact_email',
    'reviewed_by_user_id',
    'reviewed_after',
    'reviewed_before',
  ],
  offers: [
    'id',
    'sponsor_id',
    'category',
    'commercial_relationship',
    'review_status',
    'verification_status',
    'is_enabled',
    'reviewed_by_user_id',
    'verified_by_user_id',
    ...[
      'starts',
      'expires',
      'verified',
      'reviewed',
      'verification_expires',
    ].flatMap((key) => [`${key}_after`, `${key}_before`]),
  ],
  campaigns: [
    'id',
    'sponsor_id',
    'commercial_relationship',
    'review_status',
    'is_enabled',
    'reviewed_by_user_id',
    ...['starts', 'ends', 'reviewed'].flatMap((key) => [
      `${key}_after`,
      `${key}_before`,
    ]),
  ],
  creatives: [
    'id',
    'campaign_id',
    'sponsor_id',
    'discount_offer_id',
    'review_status',
    'is_enabled',
    'locale',
    'platform',
    'layout',
    'action_type',
    'reviewed_by_user_id',
    'reviewed_after',
    'reviewed_before',
  ],
  placements: ['id', 'key', 'is_enabled'],
  items: [
    'creative_id',
    'is_enabled',
    'include_deleted',
    ...['starts', 'ends'].flatMap((key) => [`${key}_after`, `${key}_before`]),
  ],
  metrics: [
    'placement_item_id',
    'placement_id',
    'creative_id',
    'campaign_id',
    'sponsor_id',
    'metric_from',
    'metric_to',
    'min_impressions',
    'min_clicks',
    'min_code_copies',
  ],
};
const enums: Record<string, z.ZodType> = {
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  review_status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  verification_status: z.enum(['UNVERIFIED', 'VERIFIED', 'FAILED']),
  category: DiscountCategorySchema,
  commercial_relationship: CommercialRelationshipSchema,
  locale: AdLocaleSchema,
  platform: AdPlatformSchema,
  layout: AdLayoutSchema,
  action_type: AdActionTypeSchema,
  key: AdPlacementKeySchema,
};
const dateFields: Record<string, string> = {
  created: 'created_at',
  reviewed: 'reviewed_at',
  starts: 'starts_at',
  ends: 'ends_at',
  expires: 'expires_at',
  verified: 'verified_at',
  verification_expires: 'verification_valid_until',
};
export function demoCommercialPage<T extends object>(
  state: DemoCommercialState,
  entity: string,
  records: T[],
  params: URLSearchParams,
  empty: boolean,
  reader = false,
) {
  const values = Object.fromEntries(params);
  const valid = new Set([...common, ...(fields[entity] ?? [])]);
  for (const [key, value] of Object.entries(values)) {
    if (
      !valid.has(key) ||
      (reader && ['reviewed_by_user_id', 'verified_by_user_id'].includes(key))
    )
      throw new ValidationError(copy.validation.invalid);
    if (
      (key === 'id' || key.endsWith('_id')) &&
      !z.string().uuid().safeParse(value).success
    )
      throw new ValidationError(copy.validation.invalid);
    if (enums[key] && !enums[key].safeParse(value).success)
      throw new ValidationError(copy.validation.invalid);
    if (
      ['is_enabled', 'include_deleted'].includes(key) &&
      !['true', 'false'].includes(value)
    )
      throw new ValidationError(copy.validation.invalid);
    if (
      (key.endsWith('_after') || key.endsWith('_before')) &&
      !z.string().datetime({ offset: true }).safeParse(value).success
    )
      throw new ValidationError(copy.validation.date);
    if (
      key.startsWith('metric_') &&
      ['metric_from', 'metric_to'].includes(key) &&
      !z.string().date().safeParse(value).success
    )
      throw new ValidationError(copy.validation.date);
    if (
      key.startsWith('min_') &&
      (!Number.isInteger(Number(value)) ||
        Number(value) < 0 ||
        Number(value) > 2147483647)
    )
      throw new ValidationError(copy.validation.invalid);
    if (key === 'contact_email' && !z.string().email().safeParse(value).success)
      throw new ValidationError(copy.validation.invalid);
    if (key === 'query' && value.trim().length > 500)
      throw new ValidationError(copy.validation.invalid);
  }
  Object.keys(dateFields).forEach((key) => {
    const after = values[`${key}_after`];
    const before = values[`${key}_before`];
    if (after && before && Date.parse(after) > Date.parse(before))
      throw new ValidationError(copy.validation.window);
  });
  if (
    values.metric_from &&
    values.metric_to &&
    values.metric_from > values.metric_to
  )
    throw new ValidationError(copy.validation.window);
  const limit = Number(values.limit ?? 100);
  const offset = Number(values.offset ?? 0);
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger(offset) ||
    offset < 0
  )
    throw new ValidationError(copy.validation.invalid);
  const rows = empty
    ? []
    : records.filter((record) => {
        const row = record as Record<string, unknown>;
        return Object.entries(values).every(([key, value]) => {
          if (['limit', 'offset', 'include_deleted'].includes(key)) return true;
          if (key === 'query') {
            const search = value.trim().toLocaleLowerCase();
            if (!search) return true;
            if (entity === 'metrics' || entity === 'items') {
              const item =
                entity === 'items'
                  ? row
                  : state.items.find(
                      (candidate) => candidate.id === row.placement_item_id,
                    );
              const creative = state.creatives.find(
                (candidate) => candidate.id === item?.creative_id,
              );
              const placement = state.placements.find(
                (candidate) => candidate.id === item?.placement_id,
              );
              return (
                String(creative?.title ?? '')
                  .toLocaleLowerCase()
                  .includes(search) ||
                (entity === 'metrics' &&
                  String(placement?.name ?? '')
                    .toLocaleLowerCase()
                    .includes(search))
              );
            }
            const searchFields =
              entity === 'sponsors'
                ? ['name', 'legal_name', 'website_url']
                : entity === 'offers'
                  ? ['title', 'description', 'discount_label']
                  : entity === 'creatives'
                    ? ['title', 'subtitle', 'action_title']
                    : ['name'];
            return searchFields.some((field) =>
              String(row[field] ?? '')
                .toLocaleLowerCase()
                .includes(search),
            );
          }
          if (
            entity === 'metrics' &&
            key.endsWith('_id') &&
            key !== 'placement_item_id'
          ) {
            const item = state.items.find(
              (item) => item.id === row.placement_item_id,
            );
            const creative = state.creatives.find(
              (creative) => creative.id === item?.creative_id,
            );
            return (
              String(
                key === 'placement_id'
                  ? item?.placement_id
                  : key === 'creative_id'
                    ? item?.creative_id
                    : creative?.[key as 'campaign_id' | 'sponsor_id'],
              ) === value
            );
          }
          if (key === 'metric_from') return String(row.metric_date) >= value;
          if (key === 'metric_to') return String(row.metric_date) <= value;
          if (key.startsWith('min_'))
            return Number(row[key.slice(4)]) >= Number(value);
          if (key.endsWith('_after') || key.endsWith('_before')) {
            const prefix = key.replace(/_(after|before)$/, '');
            const field = dateFields[prefix];
            const time = row[field];
            return (
              Boolean(time) &&
              (key.endsWith('_after')
                ? Date.parse(String(time)) >= Date.parse(value)
                : Date.parse(String(time)) <= Date.parse(value))
            );
          }
          if (key === 'platform')
            return (
              Array.isArray(row.supported_platforms) &&
              row.supported_platforms.includes(value)
            );
          if (key === 'locale')
            return row.locale === AdLocaleSchema.parse(value);
          return String(row[key]) === value;
        });
      });
  const data = rows.slice(offset, offset + limit);
  const hasMore = offset + limit < rows.length;
  return {
    data,
    page: {
      limit,
      offset,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    },
  };
}
