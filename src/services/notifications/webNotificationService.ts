'use client';
import { strings } from '@/strings';
import type { MessagePayload } from 'firebase/messaging';
import type { MessagingConfig } from './models/messagingConfig';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import type { NotificationStatus } from './models/notificationStatus';
import type { NotificationPreferenceService } from './notificationPreferenceService';
import type { NotificationDisableOptions } from './models/notificationDisableOptions';
export class WebNotificationService {
  private token: string | null = null;
  constructor(
    private readonly api: ApiClientInterface,
    private readonly config: MessagingConfig,
    private readonly preference: NotificationPreferenceService,
  ) {}
  private get preferenceKey() {
    return this.preference.storageKey;
  }
  private async supported() {
    return (
      window.isSecureContext &&
      strings.ui.webNotificationService.notification in window &&
      'serviceWorker' in navigator &&
      (await (await import('firebase/messaging')).isSupported())
    );
  }
  private async messaging() {
    const [{ initializeApp, getApps }, { getMessaging }] = await Promise.all([
      import('firebase/app'),
      import('firebase/messaging'),
    ]);
    const app =
      getApps().find((app) => app.name === 'portal-messaging') ||
      initializeApp(this.config.firebase, 'portal-messaging');
    return getMessaging(app);
  }
  async status(): Promise<NotificationStatus> {
    if (this.preference.getChoice() === 'off') return 'off';
    if (!(await this.supported())) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.permission === 'granted' &&
      this.preference.getChoice() === 'enabled'
      ? 'enabled'
      : 'undecided';
  }
  async enable(): Promise<NotificationStatus> {
    if (!(await this.supported())) return 'unsupported';
    const permission = await Notification.requestPermission();
    if (permission !== 'granted')
      return permission === 'denied' ? 'denied' : 'undecided';
    await this.register();
    this.preference.saveChoice('enabled');
    return 'enabled';
  }
  async listen(
    listener: (payload: MessagePayload) => void,
  ): Promise<(() => void) | null> {
    if ((await this.status()) !== 'enabled') return null;
    if (!this.token) await this.register();
    const { onMessage } = await import('firebase/messaging');
    return onMessage(await this.messaging(), listener);
  }
  async disable(options: NotificationDisableOptions = {}): Promise<void> {
    const token =
      this.token || localStorage.getItem(`${this.preferenceKey}:token`);
    if (options.preference === 'forget') this.preference.forgetChoice();
    else if (options.preference !== 'preserve')
      this.preference.saveChoice('off');
    if (!token || !(await this.supported())) {
      this.token = null;
      localStorage.removeItem(`${this.preferenceKey}:token`);
      return;
    }
    // Revoke the FCM token even if the API is temporarily unavailable.
    try {
      if (token && !options.skipBackend)
        await this.api.request('/devices/', {
          method: 'DELETE',
          body: { device_token: token },
        });
    } finally {
      const { deleteToken } = await import('firebase/messaging');
      await deleteToken(await this.messaging());
      this.token = null;
      localStorage.removeItem(`${this.preferenceKey}:token`);
    }
  }
  private async register() {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    const registration = await navigator.serviceWorker.ready;
    const { getToken, deleteToken } = await import('firebase/messaging');
    const messaging = await this.messaging();
    const token = await getToken(messaging, {
      vapidKey: this.config.vapidKey,
      serviceWorkerRegistration: registration,
    });
    try {
      await this.api.request('/devices/', {
        method: 'POST',
        body: { device_token: token, device_type: 'Web' },
      });
    } catch (error) {
      await deleteToken(messaging).catch(() => undefined);
      throw error;
    }
    this.token = token;
    localStorage.setItem(`${this.preferenceKey}:token`, token);
  }
}
