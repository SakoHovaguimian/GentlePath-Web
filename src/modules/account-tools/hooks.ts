'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import type { AccountDeviceQuery } from './models/accountDeviceQuery';
import type { AccountToolsPaging } from './models/accountToolsPaging';
import type { NotificationDeliveryQuery } from './models/notificationDeliveryQuery';
import type { AccountDeletion } from './models/accountDeletion';
import type { LegalContext } from './models/legalInformation';
import { accountToolsQueryKeys as keys } from './queryKeys';

export function useAccountDevices(query: AccountDeviceQuery) {
  const { accountToolsService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.devices(query),
    queryFn: ({ signal }) => service.devices(query, signal),
  });
}
export function useNotificationDeliveries(query: NotificationDeliveryQuery) {
  const { accountToolsService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.deliveries(query),
    queryFn: ({ signal }) => service.deliveries(query, signal),
  });
}
export function useDeliveryAttempts(id: string, paging: AccountToolsPaging) {
  const { accountToolsService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.attempts(id, paging),
    queryFn: ({ signal }) => service.deliveryAttempts(id, paging, signal),
  });
}
export function useLegalInformation(context: LegalContext) {
  const { accountToolsService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.legal(context),
    queryFn: ({ signal }) => service.legal(context, signal),
  });
}
export function useFrequentlyAskedQuestions() {
  const { accountToolsService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.faq,
    queryFn: ({ signal }) => service.faq(signal),
  });
}
function useAccountToolsMutation<T, R>(mutationFn: (input: T) => Promise<R>) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => cache.invalidateQueries({ queryKey: keys.all }),
  });
}
export function useRemoveAccountDevice() {
  const { accountToolsService: service } = useServiceContainer();
  return useAccountToolsMutation((id: string) => service.removeDevice(id));
}
export function useDeleteAccount() {
  const { accountToolsService: service } = useServiceContainer();
  return useMutation({
    mutationFn: (input: AccountDeletion) => service.deleteAccount(input),
    retry: false,
  });
}
