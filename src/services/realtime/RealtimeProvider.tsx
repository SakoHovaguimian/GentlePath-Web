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
import { WebNotificationService } from '@/services/notifications/webNotificationService';
import type { NotificationStatus } from '@/services/notifications/models/notificationStatus';
import { RealtimeEventSchema } from './models/realtimeEvent';
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
      config.demoMode
        ? 'demo'
        : config.messaging
          ? 'available'
          : 'unconfigured',
    );
  const seen = useRef(new Set<string>());
  const stopNotifications = useRef<(() => void) | null>(null);
  const stopSocket = useRef<(() => void) | null>(null);
  const notifications = useMemo(
    () =>
      !config.demoMode && config.messaging && session
        ? new WebNotificationService(
            container.apiClient,
            config.messaging,
            session.user.id,
          )
        : null,
    [config.demoMode, config.messaging, container, session],
  );
  const receive = useCallback(
    (input: unknown) => {
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
    stopNotifications.current?.();
    stopNotifications.current =
      (await notifications?.listen((payload) => {
        try {
          if (payload.data?.portal_event)
            receive(JSON.parse(payload.data.portal_event));
        } catch {
          /* Ignore malformed external events. */
        }
      })) || null;
  }, [notifications, receive]);
  useEffect(() => {
    const socketUrl = config.socketUrl;
    if (config.demoMode || !socketUrl) return;
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
        socket.on('portal.event', receive);
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
  }, [config.demoMode, config.socketUrl, container, queryClient, receive]);
  useEffect(() => {
    if (!notifications) return;
    let disposed = false;
    void notifications
      .status()
      .then(async (value) => {
        if (disposed) return;
        setNotificationStatus(value);
        await startNotifications();
        if (disposed) stopNotifications.current?.();
      })
      .catch(() => {
        if (!disposed) setNotificationStatus('available');
      });
    return () => {
      disposed = true;
      stopNotifications.current?.();
    };
  }, [notifications, startNotifications]);
  const value: RealtimeContextValue = {
    status,
    notificationStatus,
    enableNotifications: async () => {
      if (notifications) {
        setNotificationStatus(await notifications.enable());
        await startNotifications();
      }
    },
    disableNotifications: async () => {
      stopNotifications.current?.();
      await notifications?.disable();
      setNotificationStatus('available');
    },
    prepareForLogout: async (options = {}) => {
      stopSocket.current?.();
      stopNotifications.current?.();
      await notifications?.disable({ skipBackend: options.accountDeleted });
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
