import 'server-only';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { Sponsor } from '../models/sponsor';
import type { DiscountOffer } from '../models/discountOffer';
import type { AdCampaign } from '../models/adCampaign';
import type { AdCreative } from '../models/adCreative';
import type { AdPlacement } from '../models/adPlacement';
import type { AdPlacementItem } from '../models/adPlacementItem';
import type { AdDailyMetric } from '../models/adDailyMetric';
export interface DemoCommercialState {
  sponsors: Sponsor[];
  offers: DiscountOffer[];
  campaigns: AdCampaign[];
  creatives: AdCreative[];
  placements: AdPlacement[];
  items: AdPlacementItem[];
  metrics: AdDailyMetric[];
}
function seed(): DemoCommercialState {
  const now = new Date().toISOString();
  const past = new Date(Date.now() - 86400000).toISOString();
  const future = new Date(Date.now() + 90 * 86400000).toISOString();
  const ids = {
    sponsor: '73000000-0000-4000-8000-000000000001',
    offer: '73000000-0000-4000-8000-000000000002',
    campaign: '73000000-0000-4000-8000-000000000003',
    creative: '73000000-0000-4000-8000-000000000004',
    placement: '73000000-0000-4000-8000-000000000005',
    item: '73000000-0000-4000-8000-000000000006',
    home: '73000000-0000-4000-8000-000000000007',
    homeItem: '73000000-0000-4000-8000-000000000008',
  };
  const life = { deleted: false, created_at: now, updated_at: now };
  const review = {
    review_status: 'APPROVED' as const,
    is_enabled: true,
    reviewed_by_user_id: null,
    reviewed_at: now,
    review_notes: null,
  };
  return {
    sponsors: [
      {
        ...life,
        id: ids.sponsor,
        name: copy.demo.sponsorName,
        legal_name: copy.demo.legalName,
        website_url: copy.demo.website,
        logo_url: null,
        contact_email: copy.demo.contact,
        status: 'APPROVED',
        reviewed_by_user_id: null,
        reviewed_at: now,
        review_notes: null,
      },
    ],
    offers: [
      {
        ...life,
        ...review,
        id: ids.offer,
        sponsor_id: ids.sponsor,
        commercial_relationship: 'PAID_SPONSORSHIP',
        disclosure_label: copy.demo.disclosure,
        affiliate_disclosure: null,
        title: copy.demo.offerTitle,
        description: copy.demo.offerDescription,
        category: 'EDUCATION',
        discount_label: copy.demo.discountLabel,
        code: copy.demo.code,
        landing_url: copy.demo.website,
        terms_text: copy.demo.terms,
        starts_at: past,
        expires_at: future,
        verification_status: 'VERIFIED',
        verified_by_user_id: null,
        verified_at: now,
        verification_valid_until: future,
        verification_source_url: copy.demo.website,
      },
    ],
    campaigns: [
      {
        ...life,
        ...review,
        id: ids.campaign,
        sponsor_id: ids.sponsor,
        name: copy.demo.campaignName,
        commercial_relationship: 'PAID_SPONSORSHIP',
        starts_at: past,
        ends_at: future,
      },
    ],
    creatives: [
      {
        ...life,
        ...review,
        id: ids.creative,
        campaign_id: ids.campaign,
        sponsor_id: ids.sponsor,
        discount_offer_id: ids.offer,
        title: copy.demo.creativeTitle,
        subtitle: copy.demo.creativeSubtitle,
        image_url: null,
        image_alt_text: null,
        layout: 'FEATURE_CARD',
        image_fit: 'COVER',
        background_color: null,
        tint_color: null,
        title_color: null,
        subtitle_color: null,
        button_tint_color: null,
        button_text_color: null,
        disclosure_label: copy.demo.disclosure,
        affiliate_disclosure: null,
        action_title: copy.demo.creativeAction,
        action_type: 'OPEN_APP_ROUTE',
        action_value: `/family-discounts/${ids.offer}`,
        locale: 'en',
        supported_platforms: ['WEB', 'IOS', 'ANDROID'],
      },
    ],
    placements: [
      {
        ...life,
        id: ids.placement,
        key: 'FAMILY_DISCOUNTS_CAROUSEL',
        name: copy.demo.placementName,
        is_enabled: true,
        max_items: 5,
        auto_advance_seconds: null,
        show_pagination: true,
      },
      {
        ...life,
        id: ids.home,
        key: 'HOME_CAROUSEL',
        name: copy.demo.homePlacementName,
        is_enabled: true,
        max_items: 5,
        auto_advance_seconds: null,
        show_pagination: true,
      },
    ],
    items: [
      {
        ...life,
        id: ids.item,
        placement_id: ids.placement,
        creative_id: ids.creative,
        position: 0,
        is_enabled: true,
        starts_at: null,
        ends_at: null,
      },
      {
        ...life,
        id: ids.homeItem,
        placement_id: ids.home,
        creative_id: ids.creative,
        position: 0,
        is_enabled: true,
        starts_at: null,
        ends_at: null,
      },
    ],
    metrics: [
      {
        id: crypto.randomUUID(),
        placement_item_id: ids.item,
        metric_date: now.slice(0, 10),
        impressions: 48,
        clicks: 7,
        code_copies: 0,
        created_at: now,
        updated_at: now,
      },
    ],
  };
}
const globalCommercial = globalThis as typeof globalThis & {
  gentlePathCommercialState?: DemoCommercialState;
  gentlePathCommercialMetricLimits?: Map<
    string,
    { window: number; count: number }
  >;
};
export function getDemoCommercialState() {
  globalCommercial.gentlePathCommercialState ??= seed();
  return globalCommercial.gentlePathCommercialState;
}
export function resetDemoCommercialState() {
  globalCommercial.gentlePathCommercialState = seed();
  globalCommercial.gentlePathCommercialMetricLimits?.clear();
}

/** Authentication identity is retained only in this short-lived ingestion throttle, never aggregate rows. */
export function takeDemoCommercialMetricSlot(userId: string, now: number) {
  const limits = (globalCommercial.gentlePathCommercialMetricLimits ??=
    new Map());
  for (const [id, value] of limits)
    if (now - value.window >= 60000) limits.delete(id);
  const current = limits.get(userId) ?? { window: now, count: 0 };
  if (current.count >= 60) return false;
  current.count += 1;
  limits.set(userId, current);
  return true;
}
