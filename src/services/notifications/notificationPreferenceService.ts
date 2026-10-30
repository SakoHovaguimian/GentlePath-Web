import type { NotificationChoice } from './models/notificationChoice';

export class NotificationPreferenceService {
  readonly storageKey: string;
  constructor(userId: string, demoMode = false) {
    this.storageKey = `${demoMode ? 'portal-demo-push' : 'portal-push'}:${userId}`;
  }
  getChoice(): NotificationChoice {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored === 'true'
        ? 'enabled'
        : stored === 'false'
          ? 'off'
          : 'undecided';
    } catch {
      return 'undecided';
    }
  }
  saveChoice(choice: Exclude<NotificationChoice, 'undecided'>) {
    localStorage.setItem(this.storageKey, String(choice === 'enabled'));
  }
  forgetChoice() {
    localStorage.removeItem(this.storageKey);
  }
}
