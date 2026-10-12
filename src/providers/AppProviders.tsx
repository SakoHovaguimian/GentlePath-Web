'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type AppSession } from '@/models';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { ClientServiceContainer } from '@/clientContainer';
import { createQueryClient } from '@/lib/client/queryClient';
import { PresentationProvider } from '@/presentation/PresentationProvider';
import { RealtimeProvider } from '@/services/realtime/RealtimeProvider';
import { SessionKeepAlive } from '@/services/session/components/SessionKeepAlive';
import { strings } from '@/strings';
import { ThemePreferenceProvider } from './ThemePreferenceProvider';
import { MotionPreferenceProvider } from './MotionPreferenceProvider';
import { NavigationGuardProvider } from './NavigationGuardProvider';
import { FloatingAssistantProvider } from '@/components/ui/components/FloatingAssistantProvider';
export { useThemePreference } from './ThemePreferenceProvider';
const ContainerContext = createContext<ClientServiceContainer | null>(null);
const SessionContext = createContext<{
  session: AppSession | null;
  setSession: (session: AppSession | null) => void;
} | null>(null);
export function AppProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: AppSession | null;
}) {
  const [queryClient] = useState(createQueryClient);
  const [sessionState, setSession] = useState(session);
  const [container] = useState(() => new ClientServiceContainer());
  return (
    <SessionContext.Provider value={{ session: sessionState, setSession }}>
      <ContainerContext.Provider value={container}>
        <ThemePreferenceProvider service={container.themePreferenceService}>
          <MotionPreferenceProvider service={container.motionPreferenceService}>
            <QueryClientProvider client={queryClient}>
              <PresentationProvider>
                <NavigationGuardProvider>
                  <FloatingAssistantProvider>
                    <RealtimeProvider>
                      <SessionKeepAlive />
                      {children}
                    </RealtimeProvider>
                  </FloatingAssistantProvider>
                </NavigationGuardProvider>
              </PresentationProvider>
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </QueryClientProvider>
          </MotionPreferenceProvider>
        </ThemePreferenceProvider>
      </ContainerContext.Provider>
    </SessionContext.Provider>
  );
}
export function useServiceContainer() {
  const value = useContext(ContainerContext);
  if (!value) throw new Error(strings.errors.provider);
  return value;
}
export function useSessionState() {
  const value = useContext(SessionContext);
  if (!value) throw new Error(strings.errors.provider);
  return value;
}
