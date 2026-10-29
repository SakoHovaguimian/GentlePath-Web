import { z } from 'zod';
import { SponsorSchema, SponsorInputSchema } from './sponsor';
import {
  DiscountOfferSchema,
  DiscountOfferCreateSchema,
  DiscountOfferUpdateSchema,
} from './discountOffer';
import {
  AdCampaignSchema,
  AdCampaignCreateSchema,
  AdCampaignUpdateSchema,
} from './adCampaign';
import {
  AdCreativeSchema,
  AdCreativeCreateSchema,
  AdCreativeUpdateSchema,
} from './adCreative';
import {
  AdPlacementSchema,
  AdPlacementCreateSchema,
  AdPlacementUpdateSchema,
} from './adPlacement';
export const CommercialEntitySchema = z.enum([
  'sponsors',
  'offers',
  'campaigns',
  'creatives',
  'placements',
]);
export type CommercialEntity = z.infer<typeof CommercialEntitySchema>;
export const commercialSchemas = {
  sponsors: SponsorSchema,
  offers: DiscountOfferSchema,
  campaigns: AdCampaignSchema,
  creatives: AdCreativeSchema,
  placements: AdPlacementSchema,
};
export const commercialCreateSchemas = {
  sponsors: SponsorInputSchema,
  offers: DiscountOfferCreateSchema,
  campaigns: AdCampaignCreateSchema,
  creatives: AdCreativeCreateSchema,
  placements: AdPlacementCreateSchema,
};
export const commercialUpdateSchemas = {
  sponsors: SponsorInputSchema,
  offers: DiscountOfferUpdateSchema,
  campaigns: AdCampaignUpdateSchema,
  creatives: AdCreativeUpdateSchema,
  placements: AdPlacementUpdateSchema,
};
export type CommercialRecord = z.infer<
  (typeof commercialSchemas)[CommercialEntity]
>;
export type CommercialRecords = {
  [K in CommercialEntity]: z.infer<(typeof commercialSchemas)[K]>;
};
