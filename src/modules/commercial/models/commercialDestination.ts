import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
export const CommercialAppRouteSchema = z
  .string()
  .regex(
    /^\/(?:resources|guided-steps|blogs|posts|polls|milestones|family-discounts)(?:\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?$/,
    copy.validation.action,
  );
export const CommercialDestinationSchema = z.object({
  href: z.string().startsWith('/'),
});
export function commercialWebRoute(route: string) {
  if (route.startsWith('/milestones/'))
    return `/tips?milestone_id=${encodeURIComponent(route.split('/')[2]!)}`;
  return route
    .replace(/^\/family-discounts(?=\/|$)/, '/discounts')
    .replace(/^\/guided-steps(?=\/|$)/, '/guides')
    .replace(/^\/blogs(?=\/|$)/, '/blog')
    .replace(/^\/posts(?=\/|$)/, '/community');
}
