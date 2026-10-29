import type { SavedContentType } from '../../models/savedContentType';
export interface DemoFavorite {
  id: string;
  userId: string;
  contentType: SavedContentType;
  contentId: string;
  createdAt: string;
}
