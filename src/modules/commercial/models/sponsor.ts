import { z } from 'zod';
import {
  contentUrl,
  publicContentUrl,
  text,
  lifecycleShape,
  dateTime,
} from './commercialValidation';
export const SponsorInputSchema = z
  .object({
    name: text(300),
    legal_name: text(500).nullable(),
    website_url: contentUrl,
    logo_url: publicContentUrl.nullable(),
    contact_email: z.string().trim().email().max(320).nullable(),
  })
  .strict();
export const SponsorSchema = SponsorInputSchema.extend({
  ...lifecycleShape,
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  reviewed_by_user_id: z.string().uuid().nullable(),
  reviewed_at: dateTime.nullable(),
  review_notes: z.string().nullable(),
}).strip();
export const SponsorPublicSchema = SponsorSchema.pick({
  id: true,
  name: true,
  website_url: true,
  logo_url: true,
});
export type Sponsor = z.infer<typeof SponsorSchema>;
export type SponsorInput = z.infer<typeof SponsorInputSchema>;
export type SponsorPublic = z.infer<typeof SponsorPublicSchema>;
