import 'server-only';
import { commercialDestination } from './commercialDestination';
import { z } from 'zod';
import {
  AuthError,
  ApiError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import { gentlePathCommercialStrings as copy } from '@/strings';
import {
  commercialSchemas,
  commercialCreateSchemas,
  commercialUpdateSchemas,
  CommercialEntitySchema,
  type CommercialEntity,
  type CommercialRecord,
} from '../models/commercialEntity';
import { CommercialReviewSchema } from '../models/commercialReview';
import { SponsorReviewSchema } from '../models/sponsorReview';
import { CommercialEnablementSchema } from '../models/commercialEnablement';
import { DiscountOfferVerificationSchema } from '../models/discountOfferVerification';
import { DiscountOfferPublicSchema } from '../models/discountOffer';
import { AdLocaleSchema, AdPlatformSchema } from '../models/adCreative';
import { AdPlacementKeySchema } from '../models/adPlacement';
import {
  AdPlacementItemsSchema,
  AdPlacementOrderSchema,
} from '../models/adPlacementItem';
import { AdMetricIngestSchema } from '../models/adMetricIngest';
import {
  getDemoCommercialState,
  takeDemoCommercialMetricSlot,
  type DemoCommercialState,
} from './demoCommercialState';
import {
  offerEligible,
  campaignEligible,
  creativeEligible,
  detailedOffer,
  detailedCampaign,
  detailedCreative,
  detailedPlacement,
  servePlacement,
} from './commercialEligibility';
import { demoCommercialPage } from './commercialDemoQuery';
export { resetDemoCommercialState } from './demoCommercialState';
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const body = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError(copy.validation.invalid);
  return result.data;
}
function details(
  state: DemoCommercialState,
  entity: CommercialEntity,
  record: CommercialRecord,
) {
  switch (entity) {
    case 'offers':
      return detailedOffer(state, commercialSchemas.offers.parse(record));
    case 'campaigns':
      return detailedCampaign(state, commercialSchemas.campaigns.parse(record));
    case 'creatives':
      return detailedCreative(state, commercialSchemas.creatives.parse(record));
    case 'placements':
      return detailedPlacement(
        state,
        commercialSchemas.placements.parse(record),
      );
    default:
      return record;
  }
}
function validateRelations(
  state: DemoCommercialState,
  entity: CommercialEntity,
  value: Record<string, unknown>,
) {
  if (entity === 'offers' || entity === 'campaigns') {
    if (
      !state.sponsors.some(
        (item) => item.id === value.sponsor_id && !item.deleted,
      )
    )
      throw new NotFoundError();
  }
  if (entity === 'creatives') {
    const campaign = state.campaigns.find(
      (item) => item.id === value.campaign_id && !item.deleted,
    );
    const offer = state.offers.find(
      (item) => item.id === value.discount_offer_id && !item.deleted,
    );
    if (!campaign) throw new NotFoundError();
    if (
      (value.discount_offer_id &&
        (!offer ||
          offer.sponsor_id !== campaign.sponsor_id ||
          offer.commercial_relationship !==
            campaign.commercial_relationship)) ||
      (campaign.commercial_relationship === 'AFFILIATE' &&
        !value.affiliate_disclosure) ||
      (value.action_type === 'COPY_DISCOUNT_CODE' && !offer?.code)
    )
      throw new ValidationError(copy.validation.relation);
  }
}
function readServingContext(params: URLSearchParams) {
  if (
    Array.from(params.keys()).some(
      (key) => !['locale', 'platform'].includes(key),
    )
  )
    throw new ValidationError();
  return {
    locale: parse(AdLocaleSchema, params.get('locale')),
    platform: parse(AdPlatformSchema, params.get('platform')),
  };
}
export async function handleCommercialRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, module, entity, id, action, tail, extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (!['portal', 'admin'].includes(area ?? '') || module !== 'commercial')
    return null;
  const actor = getDemoState().users.find(
    (item) =>
      item.id === session.user.id &&
      item.external_id === session.auth.externalId &&
      !item.deleted &&
      !item.disabled,
  );
  if (!session.demo || !actor) throw new AuthError();
  if (
    area === 'admin' &&
    !['admin', 'superadmin'].includes(actor.role ?? 'user')
  )
    throw new OwnershipError(copy.validation.forbidden);
  const state = getDemoCommercialState();
  const method = request.method;
  const now = Date.now();
  const stamp = new Date(now).toISOString();
  const empty = context.scenario === 'empty';
  if (area === 'portal') {
    if (entity === 'destination' && !id && method === 'GET')
      return json(await commercialDestination(url.searchParams, true));
    if (entity === 'offers' && !action && method === 'GET') {
      const offers = state.offers
        .filter((item) => offerEligible(state, item, now))
        .sort(
          (a, b) =>
            b.created_at.localeCompare(a.created_at) ||
            b.id.localeCompare(a.id),
        );
      if (!id) {
        const page = demoCommercialPage(
          state,
          'offers',
          offers,
          url.searchParams,
          empty,
          true,
        );
        return json({
          ...page,
          data: page.data.map((item) =>
            DiscountOfferPublicSchema.parse(detailedOffer(state, item)),
          ),
        });
      }
      const offer = offers.find((item) => item.id === id);
      if (!offer || empty) throw new NotFoundError(copy.validation.notFound);
      return json(DiscountOfferPublicSchema.parse(detailedOffer(state, offer)));
    }
    if (entity === 'placements' && id === 'key' && !tail && method === 'GET') {
      const serving = servePlacement(
        state,
        parse(AdPlacementKeySchema, action),
        readServingContext(url.searchParams),
        now,
      );
      if (!serving) throw new NotFoundError();
      return json(empty ? { ...serving, items: [] } : serving);
    }
    if (entity === 'metrics' && !id && method === 'POST') {
      if (!takeDemoCommercialMetricSlot(actor.id, now))
        throw new ApiError(copy.validation.metric, 429);
      const input = parse(AdMetricIngestSchema, await body(request));
      const dates = [
        stamp.slice(0, 10),
        new Date(now - 86400000).toISOString().slice(0, 10),
      ];
      if (!dates.includes(input.metric_date))
        throw new ValidationError(copy.validation.metric);
      const item = state.items.find(
        (row) => row.id === input.placement_item_id && !row.deleted,
      );
      const placement = state.placements.find(
        (row) => row.id === item?.placement_id && !row.deleted,
      );
      const served = placement
        ? servePlacement(state, placement.key, input, now)?.items.find(
            (row) => row.id === item?.id,
          )
        : null;
      if (
        !served ||
        (input.code_copies &&
          (served.creative?.action_type !== 'COPY_DISCOUNT_CODE' ||
            !served.creative.action_value))
      )
        throw new NotFoundError(copy.validation.metric);
      const existing = state.metrics.find(
        (row) =>
          row.placement_item_id === input.placement_item_id &&
          row.metric_date === input.metric_date,
      );
      if (existing) {
        existing.impressions += input.impressions;
        existing.clicks += input.clicks;
        existing.code_copies += input.code_copies;
        existing.updated_at = stamp;
      } else
        state.metrics.push({
          id: crypto.randomUUID(),
          placement_item_id: input.placement_item_id,
          metric_date: input.metric_date,
          impressions: input.impressions,
          clicks: input.clicks,
          code_copies: input.code_copies,
          created_at: stamp,
          updated_at: stamp,
        });
      return json({ accepted: true });
    }
    throw new NotFoundError();
  }
  if (entity === 'metrics' && !id && method === 'GET')
    return json(
      demoCommercialPage(
        state,
        'metrics',
        [...state.metrics].sort(
          (a, b) =>
            b.metric_date.localeCompare(a.metric_date) ||
            b.id.localeCompare(a.id),
        ),
        url.searchParams,
        empty,
      ),
    );
  const type = parse(CommercialEntitySchema, entity);
  const rows = state[type] as CommercialRecord[];
  if (id && !z.string().uuid().safeParse(id).success)
    throw new ValidationError();
  const existing = id
    ? rows.find((row) => row.id === id && !row.deleted)
    : undefined;
  if (!id && !action) {
    if (method === 'GET') {
      const page = demoCommercialPage(
        state,
        type,
        rows
          .filter((row) => !row.deleted)
          .sort(
            (a, b) =>
              b.created_at.localeCompare(a.created_at) ||
              b.id.localeCompare(a.id),
          ),
        url.searchParams,
        empty,
      );
      return json({
        ...page,
        data: page.data.map((row) => details(state, type, row)),
      });
    }
    if (method === 'POST') {
      const input = parse(
        commercialCreateSchemas[type] as z.ZodType<Record<string, unknown>>,
        await body(request),
      );
      validateRelations(state, type, input);
      if (
        type === 'placements' &&
        state.placements.some((row) => row.key === input.key)
      )
        throw new ApiError(copy.validation.duplicate, 409);
      const campaign =
        type === 'creatives'
          ? state.campaigns.find((row) => row.id === input.campaign_id)
          : null;
      const record = commercialSchemas[type].parse({
        ...input,
        id: crypto.randomUUID(),
        deleted: false,
        created_at: stamp,
        updated_at: stamp,
        status: 'PENDING_REVIEW',
        review_status: 'PENDING',
        is_enabled: false,
        reviewed_by_user_id: null,
        reviewed_at: null,
        review_notes: null,
        verification_status: 'UNVERIFIED',
        verified_by_user_id: null,
        verified_at: null,
        verification_valid_until: null,
        verification_source_url: null,
        ...(campaign ? { sponsor_id: campaign.sponsor_id } : {}),
      });
      rows.push(record);
      return json(details(state, type, record), 201);
    }
  }
  if (!existing || extra) throw new NotFoundError();
  if (!action && !tail) {
    if (method === 'GET') return json(details(state, type, existing));
    if (method === 'PUT') {
      const input = parse(
        commercialUpdateSchemas[type] as z.ZodType<Record<string, unknown>>,
        await body(request),
      );
      validateRelations(state, type, { ...existing, ...input });
      Object.assign(existing, input, { updated_at: stamp });
      if (type === 'sponsors')
        Object.assign(existing, {
          status: 'PENDING_REVIEW',
          reviewed_by_user_id: null,
          reviewed_at: null,
          review_notes: null,
        });
      if (['offers', 'campaigns', 'creatives'].includes(type))
        Object.assign(existing, {
          review_status: 'PENDING',
          is_enabled: false,
          reviewed_by_user_id: null,
          reviewed_at: null,
          review_notes: null,
        });
      if (type === 'offers')
        Object.assign(existing, {
          verification_status: 'UNVERIFIED',
          verified_by_user_id: null,
          verified_at: null,
          verification_valid_until: null,
          verification_source_url: null,
        });
      return json(details(state, type, existing));
    }
    if (method === 'DELETE') {
      Object.assign(existing, {
        deleted: true,
        updated_at: stamp,
        ...('is_enabled' in existing ? { is_enabled: false } : {}),
      });
      return new Response(null, {
        status: 204,
        headers: { 'cache-control': 'no-store' },
      });
    }
  }
  if (
    action === 'review' &&
    !tail &&
    method === 'PATCH' &&
    type !== 'placements'
  ) {
    if (type === 'sponsors') {
      const input = parse(SponsorReviewSchema, await body(request));
      const current = commercialSchemas.sponsors.parse(existing).status;
      if (
        !(input.status === 'SUSPENDED'
          ? current === 'APPROVED'
          : input.status === 'APPROVED'
            ? ['PENDING_REVIEW', 'SUSPENDED'].includes(current)
            : current === 'PENDING_REVIEW')
      )
        throw new ApiError(copy.validation.transition, 409);
      Object.assign(existing, input, {
        reviewed_by_user_id: actor.id,
        reviewed_at: stamp,
        updated_at: stamp,
      });
    } else {
      const input = parse(CommercialReviewSchema, await body(request));
      const current =
        'review_status' in existing ? existing.review_status : undefined;
      if (
        current === input.review_status ||
        (input.review_status === 'APPROVED' && current !== 'PENDING')
      )
        throw new ApiError(copy.validation.transition, 409);
      validateRelations(state, type, existing);
      Object.assign(existing, input, {
        is_enabled: false,
        reviewed_by_user_id: actor.id,
        reviewed_at: stamp,
        updated_at: stamp,
      });
    }
    return json(details(state, type, existing));
  }
  if (
    action === 'verification' &&
    !tail &&
    method === 'PATCH' &&
    type === 'offers'
  ) {
    const input = parse(DiscountOfferVerificationSchema, await body(request));
    const offer = commercialSchemas.offers.parse(existing);
    if (
      input.verification_status === 'VERIFIED' &&
      (!input.verification_valid_until ||
        Date.parse(input.verification_valid_until) <= now ||
        Date.parse(input.verification_valid_until) >
          Date.parse(offer.expires_at))
    )
      throw new ValidationError(copy.validation.verification);
    Object.assign(existing, input, {
      verified_by_user_id:
        input.verification_status === 'UNVERIFIED' ? null : actor.id,
      verified_at: input.verification_status === 'UNVERIFIED' ? null : stamp,
      verification_valid_until:
        input.verification_status === 'VERIFIED'
          ? input.verification_valid_until
          : null,
      updated_at: stamp,
      ...(input.verification_status !== 'VERIFIED'
        ? { is_enabled: false }
        : {}),
    });
    return json(details(state, type, existing));
  }
  if (
    action === 'enablement' &&
    !tail &&
    method === 'PATCH' &&
    ['offers', 'campaigns', 'creatives'].includes(type)
  ) {
    const input = parse(CommercialEnablementSchema, await body(request));
    const eligible =
      type === 'offers'
        ? offerEligible(
            state,
            commercialSchemas.offers.parse(existing),
            now,
            false,
            true,
          )
        : type === 'campaigns'
          ? campaignEligible(
              state,
              commercialSchemas.campaigns.parse(existing),
              now,
              false,
              true,
            )
          : creativeEligible(
              state,
              commercialSchemas.creatives.parse(existing),
              now,
              undefined,
              true,
            );
    if (input.is_enabled && !eligible)
      throw new ApiError(copy.validation.eligible, 409);
    Object.assign(existing, input, { updated_at: stamp });
    return json(details(state, type, existing));
  }
  if (type === 'placements' && action === 'items') {
    const items = state.items.filter((row) => row.placement_id === id);
    if (!tail && method === 'GET')
      return json(
        demoCommercialPage(
          state,
          'items',
          items
            .filter(
              (row) =>
                !row.deleted ||
                url.searchParams.get('include_deleted') === 'true',
            )
            .sort(
              (a, b) => a.position - b.position || a.id.localeCompare(b.id),
            ),
          url.searchParams,
          empty,
        ),
      );
    if (!tail && method === 'PUT') {
      const input = parse(AdPlacementItemsSchema, await body(request));
      for (const item of input.items) {
        if (
          (item.id &&
            !items.some(
              (row) =>
                row.id === item.id && row.creative_id === item.creative_id,
            )) ||
          !state.creatives.some(
            (row) => row.id === item.creative_id && !row.deleted,
          )
        )
          throw new ValidationError(copy.validation.items);
      }
      items.forEach((row) => {
        row.deleted = true;
        row.is_enabled = false;
        row.updated_at = stamp;
      });
      input.items.forEach((item, position) => {
        const old = items.find((row) => row.creative_id === item.creative_id);
        if (old)
          Object.assign(old, item, {
            id: old.id,
            position,
            deleted: false,
            updated_at: stamp,
          });
        else
          state.items.push({
            ...item,
            id: crypto.randomUUID(),
            placement_id: id!,
            position,
            deleted: false,
            created_at: stamp,
            updated_at: stamp,
          });
      });
      return json(details(state, type, existing));
    }
    if (tail === 'order' && method === 'PUT') {
      const input = parse(AdPlacementOrderSchema, await body(request));
      const active = items.filter((row) => !row.deleted);
      if (
        input.item_ids.length !== active.length ||
        input.item_ids.some(
          (itemId) => !active.some((row) => row.id === itemId),
        )
      )
        throw new ValidationError(copy.validation.items);
      input.item_ids.forEach((itemId, position) => {
        Object.assign(
          active.find((row) => row.id === itemId)!,
          { position, updated_at: stamp },
        );
      });
      return json(details(state, type, existing));
    }
  }
  throw new NotFoundError();
}
