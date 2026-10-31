'use client';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import type { CommercialEntity } from './models/commercialEntity';
import type { CommercialFilters } from './models/commercialDirectory';
import type { AdPlacementKey } from './models/adPlacement';
import type { CommercialService } from './services/commercialService';
const root = ['commercial'] as const;
export function useCommercialList<K extends CommercialEntity>(
  entity: K,
  filters: CommercialFilters = {},
) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'admin', entity, filters],
    queryFn: ({ signal }) => service.list(entity, filters, signal),
  });
}
export function useCommercialDetail<K extends CommercialEntity>(
  entity: K,
  id: string,
) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'admin', entity, id],
    queryFn: ({ signal }) => service.detail(entity, id, signal),
    enabled: Boolean(id),
  });
}
export function useDiscountOffers(filters: CommercialFilters = {}) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'offers', filters],
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => service.offers(filters, signal),
  });
}
export function useDiscountOffer(id: string) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'offers', id],
    queryFn: ({ signal }) => service.offer(id, signal),
  });
}
export function useCommercialServing(
  key: AdPlacementKey,
  locale = 'en',
  platform = 'WEB',
) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'serving', key, locale, platform],
    queryFn: ({ signal }) => service.serve(key, locale, platform, signal),
    staleTime: 0,
  });
}
export function useCommercialMetrics(filters: CommercialFilters = {}) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'metrics', filters],
    queryFn: ({ signal }) => service.metrics(filters, signal),
  });
}
export function useCommercialMutation<T, R>(
  operation: (service: CommercialService, input: T) => Promise<R>,
) {
  const { commercialService } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: T) => operation(commercialService, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: root }),
  });
}

export function useCommercialDestination(route: string) {
  const { commercialService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...root, 'destination', route],
    queryFn: ({ signal }) => service.destination(route, signal),
    enabled: Boolean(route),
  });
}
