import type { DiscountSort } from '../models/discountSort';

/** Input follows the API's stable newest-first order. Sort before pagination. */
export function sortDiscountOffers<
  T extends { title: string; expires_at: string; id: string },
>(offers: T[], sort: DiscountSort): T[] {
  if (sort === 'oldest') return [...offers].reverse();
  if (sort === 'latest') return offers;
  return [...offers].sort(
    (a, b) =>
      (sort === 'title'
        ? a.title.localeCompare(b.title, 'en-US')
        : Date.parse(a.expires_at) - Date.parse(b.expires_at)) ||
      a.id.localeCompare(b.id),
  );
}
