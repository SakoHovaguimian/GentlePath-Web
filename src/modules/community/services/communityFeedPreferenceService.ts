import { CommunityFeedPreferenceSchema } from '../models/communityFeedPreference';

const preferenceChanged = 'gentlepath-community-preference';

/** A device preference, isolated by account and by demo/live mode. */
export class CommunityFeedPreferenceService {
  readonly storageKey: string;

  constructor(userId: string, demoMode: boolean) {
    this.storageKey = `gentlepath-community:${demoMode ? 'demo' : 'live'}:${userId}`;
  }

  readSnapshot = () => {
    try {
      return localStorage.getItem(this.storageKey) ?? '';
    } catch {
      return '';
    }
  };

  subscribe = (onChange: () => void) => {
    const changed = (event: Event) => {
      if (
        !(event instanceof StorageEvent) ||
        event.key === this.storageKey ||
        event.key === null
      )
        onChange();
    };
    window.addEventListener('storage', changed);
    window.addEventListener(preferenceChanged, changed);
    return () => {
      window.removeEventListener('storage', changed);
      window.removeEventListener(preferenceChanged, changed);
    };
  };

  hiddenPostIds(snapshot = this.readSnapshot()): string[] {
    try {
      return CommunityFeedPreferenceSchema.parse(JSON.parse(snapshot))
        .hiddenPostIds;
    } catch {
      return [];
    }
  }

  setHidden(postId: string, hidden: boolean) {
    const current = this.hiddenPostIds();
    const hiddenPostIds = hidden
      ? [...new Set([...current, postId])].slice(-1000)
      : current.filter((id) => id !== postId);
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(CommunityFeedPreferenceSchema.parse({ hiddenPostIds })),
    );
    window.dispatchEvent(new Event(preferenceChanged));
  }

  clear() {
    localStorage.removeItem(this.storageKey);
    window.dispatchEvent(new Event(preferenceChanged));
  }
}
