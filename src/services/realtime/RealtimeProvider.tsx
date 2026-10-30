'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { NotificationPreferenceService } from '@/services/notifications/notificationPreferenceService';
import { WebNotificationService } from '@/services/notifications/webNotificationService';
import type { NotificationStatus } from '@/services/notifications/models/notificationStatus';
import { RealtimeEventSchema } from './models/realtimeEvent';
import { RealtimeMessageSchema } from './models/realtimeMessage';
import { communityQueryKeys } from '@/modules/community/queryKeys';
import { pollQueryKeys } from '@/modules/polls/queryKeys';
import { RealtimeTicketSchema } from './models/realtimeTicket';
import type { RealtimeContextValue } from './models/realtimeContext';
import { strings } from '@/strings';
import { notificationInboxQueryKeys } from '@/modules/notification-inbox/queryKeys';
const RealtimeContext = createContext<RealtimeContextValue | null>(null);
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const config = useRuntimeConfig();
  const container = useServiceContainer();
  const { session } = useSessionState();
  const queryClient = useQueryClient();
  const presentation = usePresentationService();
  const [status, setStatus] = useState<RealtimeContextValue['status']>(
    config.demoMode ? 'demo' : config.socketUrl ? 'connecting' : 'offline',
  );
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationStatus>(
      config.demoMode || config.messaging ? 'loading' : 'unconfigured',
    );
  const userId = session?.user.id;
  const preference = useMemo(
    () =>
      userId
        ? new NotificationPreferenceService(userId, config.demoMode)
        : null,
    [userId, config.demoMode],
  );
  const notificationOperation = useRef(false);
  const [notificationPending, setNotificationPending] = useState(false);
  async function updateNotifications(action: () => Promise<void>) {
    if (notificationOperation.current) return;
    notificationOperation.current = true;
    setNotificationPending(true);
    try {
      await action();
    } finally {
      notificationOperation.current = false;
      setNotificationPending(false);
    }
  }
  const seen = useRef(new Set<string>());
  const stopNotifications = useRef<(() => void) | null>(null);
  const notificationGeneration = useRef(0);
  const stopNotificationListener = useCallback(() => {
    notificationGeneration.current += 1;
    const stop = stopNotifications.current;
    stopNotifications.current = null;
    stop?.();
  }, []);
  const stopSocket = useRef<(() => void) | null>(null);
  const notifications = useMemo(
    () =>
      !config.demoMode && config.messaging && preference
        ? new WebNotificationService(
            container.apiClient,
            config.messaging,
            preference,
          )
        : null,
    [config.demoMode, config.messaging, container, preference],
  );
  const receive = useCallback(
    (input: unknown) => {
      const socketMessage = RealtimeMessageSchema.safeParse(input);
      if (socketMessage.success) {
        const event = socketMessage.data;
        if (seen.current.has(event.event_id)) return;
        seen.current.add(event.event_id);
        if (seen.current.size > 200)
          seen.current.delete(seen.current.values().next().value!);
        if (event.channel === 'notifications') {
          void queryClient.invalidateQueries({
            queryKey: notificationInboxQueryKeys.all,
          });
        } else if (event.channel === 'chat') {
          void queryClient.invalidateQueries({ queryKey: ['chat'] });
        } else {
          void queryClient.invalidateQueries({
            queryKey: communityQueryKeys.all,
          });
          void queryClient.invalidateQueries({ queryKey: pollQueryKeys.all });
        }
        return;
      }
      const parsed = RealtimeEventSchema.safeParse(input);
      if (!parsed.success || seen.current.has(parsed.data.event_id)) return;
      const event = parsed.data;
      seen.current.add(event.event_id);
      if (seen.current.size > 200)
        seen.current.delete(seen.current.values().next().value!);
      if (event.event_type === 'notification') {
        void queryClient.invalidateQueries({
          queryKey: notificationInboxQueryKeys.all,
        });
        void presentation.showToast({
          title: event.data.title,
          description: event.data.body,
          intent: 'info',
          position: 'top-right',
        });
      } else void queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
    [presentation, queryClient],
  );
  const startNotifications = useCallback(async () => {
    stopNotificationListener();
    const generation = notificationGeneration.current;
    const stop =
      (await notifications?.listen((payload) => {
        try {
          if (payload.data?.portal_event)
            receive(JSON.parse(payload.data.portal_event));
        } catch {
          /* Ignore malformed external events. */
        }
      })) || null;
    if (generation !== notificationGeneration.current) {
      stop?.();
      return;
    }
    stopNotifications.current = stop;
  }, [notifications, receive, stopNotificationListener]);
  useEffect(() => {
    const socketUrl = config.socketUrl;
    if (config.demoMode || !socketUrl || !session?.user.id) return;
    let stopped = false;
    let disconnect = () => {};
    void import('socket.io-client')
      .then(({ io }) => {
        if (stopped) return;
        const socket = io(socketUrl, {
          autoConnect: false,
          transports: ['websocket'],
          reconnectionDelay: 1000,
          reconnectionDelayMax: 15000,
          auth: async (callback) => {
            try {
              const ticket = RealtimeTicketSchema.parse(
                await container.apiClient.request('/realtime/tickets', {
                  method: 'POST',
                }),
              );
              if (!stopped) callback({ ticket: ticket.ticket });
            } catch {
              if (!stopped) callback({});
            }
          },
        });
        let retry: ReturnType<typeof setTimeout> | undefined;
        socket.on('connect', () => {
          setStatus('connected');
          for (const channel of ['community', 'chat']) {
            socket.emit('rt:command', {
              event_id: crypto.randomUUID(),
              type: 'SUBSCRIBE',
              channel,
            });
          }
          void queryClient.invalidateQueries({ queryKey: ['chat'] });
        });
        socket.on('disconnect', () => setStatus('offline'));
        socket.on('connect_error', () => {
          setStatus('offline');
          if (!socket.active && !stopped) {
            clearTimeout(retry);
            retry = setTimeout(() => socket.connect(), 10000);
          }
        });
        socket.on('rt:message', receive);
        socket.connect();
        const stop = () => {
          stopped = true;
          clearTimeout(retry);
          socket.removeAllListeners();
          socket.disconnect();
        };
        stopSocket.current = stop;
        disconnect = stop;
      })
      .catch(() => {
        if (!stopped) setStatus('offline');
      });
    return () => {
      stopped = true;
      disconnect();
    };
  }, [
    config.demoMode,
    config.socketUrl,
    container,
    queryClient,
    receive,
    session?.user.id,
  ]);
  useEffect(() => {
    if (!preference) return;
    let disposed = false;
    const refresh = async () => {
      try {
        if (notificationOperation.current) return;
        const value = config.demoMode
          ? preference.getChoice()
          : notifications
            ? await notifications.status()
            : 'unconfigured';
        if (disposed) return;
        setNotificationStatus(value);
        if (
          value === 'enabled' &&
          notifications &&
          !stopNotifications.current
        ) {
          await startNotifications();
          if (disposed) {
            stopNotificationListener();
          }
        } else if (value !== 'enabled') {
          stopNotificationListener();
        }
      } catch {
        if (!disposed) setNotificationStatus('unconfigured');
      }
    };
    const onFocus = () => {
      void refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === preference.storageKey || event.key === null)
        void refresh();
    };
    void refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    return () => {
      disposed = true;
      stopNotificationListener();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
    };
  }, [
    config.demoMode,
    notifications,
    preference,
    startNotifications,
    stopNotificationListener,
  ]);
  const value: RealtimeContextValue = {
    status,
    notificationStatus,
    notificationPending,
    enableNotifications: () =>
      updateNotifications(async () => {
        if (config.demoMode && preference) {
          preference.saveChoice('enabled');
          setNotificationStatus('enabled');
        } else if (notifications) {
          setNotificationStatus(await notifications.enable());
          await startNotifications();
        }
      }),
    disableNotifications: () =>
      updateNotifications(async () => {
        stopNotificationListener();
        if (config.demoMode && preference) {
          preference.saveChoice('off');
          setNotificationStatus('off');
        } else if (notifications) {
          try {
            await notifications.disable();
          } finally {
            setNotificationStatus(await notifications.status());
          }
        }
      }),
    refreshNotifications: () =>
      updateNotifications(async () => {
        if (config.demoMode && preference)
          setNotificationStatus(preference.getChoice());
        else if (notifications) {
          setNotificationStatus(await notifications.status());
          await startNotifications();
        }
      }),
    prepareForLogout: async (options = {}) => {
      stopSocket.current?.();
      stopNotificationListener();
      await notifications?.disable({
        skipBackend: options.accountDeleted,
        preference: options.accountDeleted ? 'forget' : 'preserve',
      });
      if (config.demoMode && options.accountDeleted) preference?.forgetChoice();
    },
    simulateAlert: () => {
      if (config.demoMode)
        receive({
          event_id: crypto.randomUUID(),
          event_type: 'notification',
          occurred_at: new Date().toISOString(),
          data: {
            title: strings.chat.simulatedTitle,
            body: strings.chat.simulatedBody,
          },
        });
    },
  };
  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error(strings.errors.provider);
  return context;
}
