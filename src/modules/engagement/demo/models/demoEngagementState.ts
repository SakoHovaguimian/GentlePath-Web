import type { DemoFavorite } from './demoFavorite';
import type { DemoRating } from './demoRating';
export interface DemoEngagementState {
  favorites: DemoFavorite[];
  ratings: DemoRating[];
  blogLikes: Map<string, Set<string>>;
}
