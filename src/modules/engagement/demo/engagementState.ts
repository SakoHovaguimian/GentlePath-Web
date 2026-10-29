import 'server-only';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { getDemoBlogState } from '@/services/demo/demoBlogState';
import { getDemoState } from '@/services/demo/demoState';
import type { SavedContentType } from '../models/savedContentType';
import type { SavedContent } from '../models/savedContent';
import type { ResourceRatingSummary } from '../models/resourceRatingSummary';
import type { DemoEngagementState } from './models/demoEngagementState';
import { demoSavedTarget } from './demoSavedTarget';
const globalEngagement = globalThis as typeof globalThis & {
  gentlePathEngagementState?: DemoEngagementState;
};
export function getDemoEngagementState(): DemoEngagementState {
  if (!globalEngagement.gentlePathEngagementState) {
    const accounts = getDemoState().users.filter(
      (user) => !user.deleted && !user.disabled,
    );
    const other = accounts[1];
    globalEngagement.gentlePathEngagementState = {
      favorites: [],
      ratings: other
        ? [{ userId: other.id, resourceId: 'resource-1', rating: 4 }]
        : [],
      blogLikes: new Map(
        getDemoBlogState()
          .filter((article) => article.status === 'published')
          .map((article) => [article.id, new Set(other ? [other.id] : [])]),
      ),
    };
  }
  return globalEngagement.gentlePathEngagementState;
}
export function isDemoContentSaved(
  userId: string,
  type: SavedContentType,
  id: string,
) {
  return type === 'RESOURCE'
    ? (getDemoPortalState().favorites.get(userId)?.has(id) ?? false)
    : getDemoEngagementState().favorites.some(
        (item) =>
          item.userId === userId &&
          item.contentType === type &&
          item.contentId === id,
      );
}
export function setDemoContentSaved(
  userId: string,
  type: SavedContentType,
  id: string,
  saved: boolean,
) {
  const state = getDemoEngagementState();
  if (type === 'RESOURCE') {
    const own = getDemoPortalState().favorites.get(userId) ?? new Set<string>();
    if (saved) own.add(id);
    else own.delete(id);
    getDemoPortalState().favorites.set(userId, own);
  }
  const existing = state.favorites.find(
    (item) =>
      item.userId === userId &&
      item.contentType === type &&
      item.contentId === id,
  );
  if (saved && !existing)
    state.favorites.push({
      id: crypto.randomUUID(),
      userId,
      contentType: type,
      contentId: id,
      createdAt: new Date().toISOString(),
    });
  if (!saved)
    state.favorites = state.favorites.filter((item) => item !== existing);
}
export function getDemoSavedContent(userId: string): SavedContent[] {
  const state = getDemoEngagementState();
  // Existing resource saves remain authoritative and acquire stable pivot metadata lazily.
  for (const id of getDemoPortalState().favorites.get(userId) ?? []) {
    if (
      !state.favorites.some(
        (item) =>
          item.userId === userId &&
          item.contentType === 'RESOURCE' &&
          item.contentId === id,
      )
    )
      setDemoContentSaved(userId, 'RESOURCE', id, true);
  }
  return state.favorites
    .filter(
      (item) =>
        item.userId === userId &&
        isDemoContentSaved(userId, item.contentType, item.contentId),
    )
    .map((item) => ({
      id: item.id,
      contentType: item.contentType,
      contentId: item.contentId,
      createdAt: item.createdAt,
      target: demoSavedTarget(item.contentType, item.contentId),
    }))
    .filter((item) => item.target !== null)
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    );
}
export function getDemoSavedCount(userId: string) {
  return getDemoSavedContent(userId).length;
}
/** Batch projection for resource directories; account identities never enter the result. */
export function getDemoResourceRatingSummaries(): Map<
  string,
  ResourceRatingSummary
> {
  const activeIds = new Set(
    getDemoState()
      .users.filter((user) => !user.deleted)
      .map((user) => user.id),
  );
  const totals = new Map<string, { count: number; total: number }>();
  for (const rating of getDemoEngagementState().ratings) {
    if (!activeIds.has(rating.userId)) continue;
    const current = totals.get(rating.resourceId) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += rating.rating;
    totals.set(rating.resourceId, current);
  }
  return new Map(
    [...totals].map(([id, value]) => [
      id,
      { count: value.count, average: value.total / value.count },
    ]),
  );
}
export function getDemoResourceEngagement(userId: string, id: string) {
  const activeIds = new Set(
    getDemoState()
      .users.filter((user) => !user.deleted)
      .map((user) => user.id),
  );
  const ratings = demoSavedTarget('RESOURCE', id)
    ? getDemoEngagementState().ratings.filter(
        (item) => item.resourceId === id && activeIds.has(item.userId),
      )
    : [];
  return {
    rating: ratings.find((item) => item.userId === userId)?.rating ?? null,
    count: ratings.length,
    average: ratings.length
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
      : null,
  };
}
export function getDemoBlogEngagement(userId: string, id: string) {
  const activeIds = new Set(
    getDemoState()
      .users.filter((user) => !user.deleted)
      .map((user) => user.id),
  );
  const likes = demoSavedTarget('BLOG', id)
    ? [...(getDemoEngagementState().blogLikes.get(id) ?? [])].filter((actor) =>
        activeIds.has(actor),
      )
    : [];
  return {
    liked: likes.includes(userId),
    likesCount: likes.length,
    saved: isDemoContentSaved(userId, 'BLOG', id),
  };
}
export function resetDemoEngagementState() {
  delete globalEngagement.gentlePathEngagementState;
}
