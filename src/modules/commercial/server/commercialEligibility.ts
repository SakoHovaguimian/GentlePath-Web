import 'server-only';
import { SponsorPublicSchema } from '../models/sponsor';
import {
  DiscountOfferPublicSchema,
  type DiscountOffer,
} from '../models/discountOffer';
import { AdCampaignPublicSchema, type AdCampaign } from '../models/adCampaign';
import { AdCreativePublicSchema, type AdCreative } from '../models/adCreative';
import {
  AdPlacementPublicSchema,
  type AdPlacement,
  type AdPlacementKey,
} from '../models/adPlacement';
import type { DemoCommercialState } from './demoCommercialState';
export const withinWindow = (
  start: string | null,
  end: string | null,
  now: number,
) => (!start || Date.parse(start) <= now) && (!end || Date.parse(end) > now);
export function sponsorEligible(state: DemoCommercialState, id: string) {
  return state.sponsors.some(
    (sponsor) =>
      sponsor.id === id &&
      !sponsor.deleted &&
      sponsor.status === 'APPROVED' &&
      sponsor.reviewed_at,
  );
}
export function offerEligible(
  state: DemoCommercialState,
  offer: DiscountOffer,
  now: number,
  serving = true,
  enabling = false,
) {
  return (
    !offer.deleted &&
    (enabling || offer.is_enabled) &&
    offer.review_status === 'APPROVED' &&
    Boolean(offer.reviewed_at) &&
    sponsorEligible(state, offer.sponsor_id) &&
    (!serving || Date.parse(offer.starts_at) <= now) &&
    Date.parse(offer.expires_at) > now &&
    offer.verification_status === 'VERIFIED' &&
    Boolean(
      offer.verified_at &&
      offer.verification_source_url &&
      offer.verification_valid_until &&
      Date.parse(offer.verification_valid_until) > now,
    ) &&
    Boolean(offer.disclosure_label) &&
    (offer.commercial_relationship !== 'AFFILIATE' ||
      Boolean(offer.affiliate_disclosure))
  );
}
export function campaignEligible(
  state: DemoCommercialState,
  campaign: AdCampaign,
  now: number,
  serving = true,
  enabling = false,
) {
  return (
    !campaign.deleted &&
    (enabling || campaign.is_enabled) &&
    campaign.review_status === 'APPROVED' &&
    Boolean(campaign.reviewed_at) &&
    sponsorEligible(state, campaign.sponsor_id) &&
    (!serving || Date.parse(campaign.starts_at) <= now) &&
    (!campaign.ends_at || Date.parse(campaign.ends_at) > now)
  );
}
export function creativeEligible(
  state: DemoCommercialState,
  creative: AdCreative,
  now: number,
  context?: { locale: string; platform: string },
  enabling = false,
) {
  const campaign = state.campaigns.find(
    (item) => item.id === creative.campaign_id,
  );
  const offer = creative.discount_offer_id
    ? state.offers.find((item) => item.id === creative.discount_offer_id)
    : undefined;
  return (
    !creative.deleted &&
    (enabling || creative.is_enabled) &&
    creative.review_status === 'APPROVED' &&
    Boolean(creative.reviewed_at) &&
    (!context ||
      (creative.locale === context.locale &&
        creative.supported_platforms.includes(context.platform as 'WEB'))) &&
    Boolean(
      campaign &&
      campaignEligible(state, campaign, now, Boolean(context)) &&
      campaign.sponsor_id === creative.sponsor_id &&
      (campaign.commercial_relationship !== 'AFFILIATE' ||
        creative.affiliate_disclosure) &&
      (!creative.discount_offer_id ||
        (offer &&
          offerEligible(state, offer, now, Boolean(context)) &&
          offer.sponsor_id === campaign.sponsor_id &&
          offer.commercial_relationship === campaign.commercial_relationship)),
    ) &&
    Boolean(creative.disclosure_label) &&
    (creative.action_type !== 'COPY_DISCOUNT_CODE' || Boolean(offer?.code))
  );
}
export function detailedOffer(
  state: DemoCommercialState,
  offer: DiscountOffer,
) {
  const sponsor = state.sponsors.find(
    (item) => item.id === offer.sponsor_id && !item.deleted,
  );
  return {
    ...offer,
    sponsor: sponsor ? SponsorPublicSchema.parse(sponsor) : null,
  };
}
export function detailedCampaign(
  state: DemoCommercialState,
  campaign: AdCampaign,
) {
  const sponsor = state.sponsors.find(
    (item) => item.id === campaign.sponsor_id && !item.deleted,
  );
  return {
    ...campaign,
    sponsor: sponsor ? SponsorPublicSchema.parse(sponsor) : null,
  };
}
export function detailedCreative(
  state: DemoCommercialState,
  creative: AdCreative,
  serving = false,
) {
  const campaign = state.campaigns.find(
    (item) => item.id === creative.campaign_id && !item.deleted,
  );
  const sponsor = state.sponsors.find(
    (item) => item.id === creative.sponsor_id && !item.deleted,
  );
  const offer = state.offers.find(
    (item) => item.id === creative.discount_offer_id && !item.deleted,
  );
  return {
    ...creative,
    commercial_relationship: campaign?.commercial_relationship,
    sponsor: sponsor ? SponsorPublicSchema.parse(sponsor) : null,
    campaign: campaign
      ? AdCampaignPublicSchema.parse(detailedCampaign(state, campaign))
      : null,
    discount_offer: offer
      ? DiscountOfferPublicSchema.parse(detailedOffer(state, offer))
      : null,
    action_value:
      serving && creative.action_type === 'COPY_DISCOUNT_CODE'
        ? (offer?.code ?? null)
        : creative.action_value,
  };
}
export function detailedPlacement(
  state: DemoCommercialState,
  placement: AdPlacement,
) {
  return {
    ...placement,
    items: state.items
      .filter((item) => item.placement_id === placement.id && !item.deleted)
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
      .map((item) => {
        const creative = state.creatives.find(
          (row) => row.id === item.creative_id && !row.deleted,
        );
        return {
          ...item,
          creative: creative
            ? AdCreativePublicSchema.parse(detailedCreative(state, creative))
            : null,
        };
      }),
  };
}
export function servePlacement(
  state: DemoCommercialState,
  key: AdPlacementKey,
  context: { locale: string; platform: string },
  now: number,
) {
  const placement = state.placements.find(
    (item) => item.key === key && !item.deleted,
  );
  if (!placement) return null;
  const items = placement.is_enabled
    ? state.items
        .filter(
          (item) =>
            item.placement_id === placement.id &&
            !item.deleted &&
            item.is_enabled &&
            withinWindow(item.starts_at, item.ends_at, now),
        )
        .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
        .flatMap((item) => {
          const creative = state.creatives.find(
            (row) => row.id === item.creative_id,
          );
          return creative && creativeEligible(state, creative, now, context)
            ? [
                {
                  ...item,
                  creative: AdCreativePublicSchema.parse(
                    detailedCreative(state, creative, true),
                  ),
                },
              ]
            : [];
        })
        .slice(0, placement.max_items)
    : [];
  return AdPlacementPublicSchema.parse({ ...placement, items });
}
