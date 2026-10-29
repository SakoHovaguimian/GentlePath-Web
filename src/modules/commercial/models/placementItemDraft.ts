import type { AdPlacementItemInput } from './adPlacementItem';
export interface PlacementItemDraft extends Omit<
  AdPlacementItemInput,
  'id' | 'starts_at' | 'ends_at'
> {
  id: string;
  existingId?: string;
  starts_at: string;
  ends_at: string;
}
