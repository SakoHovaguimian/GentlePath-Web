'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import type { DocumentMetadataInput } from './models/careDocument';
import type { DocumentQuery } from './models/documentQuery';

export const documentVaultQueryKeys = {
  all: ['portal', 'documents'] as const,
  list: (input: DocumentQuery) =>
    ['portal', 'documents', 'list', input] as const,
};

export function useDocuments(input: DocumentQuery) {
  const { documentVaultService: service } = useServiceContainer();
  return useQuery({
    queryKey: documentVaultQueryKeys.list(input),
    queryFn: ({ signal }) => service.list(input, signal),
  });
}

export function useUploadDocument() {
  const { documentVaultService: service } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      input,
      uploadId,
      signal,
    }: {
      file: File;
      input: DocumentMetadataInput;
      uploadId: string;
      signal: AbortSignal;
    }) => service.upload(file, input, uploadId, signal),
    // A cancelled/failed response can still have reached the server. Refresh
    // the list so the user can see that outcome before choosing to retry.
    onSettled: () =>
      cache.invalidateQueries({ queryKey: documentVaultQueryKeys.all }),
    retry: false,
  });
}

export function useUpdateDocument() {
  const { documentVaultService: service } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentMetadataInput }) =>
      service.update(id, input),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: documentVaultQueryKeys.all }),
  });
}

export function useDeleteDocument() {
  const { documentVaultService: service } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: documentVaultQueryKeys.all }),
  });
}

export function useDownloadDocument() {
  const { documentVaultService: service } = useServiceContainer();
  return useMutation({
    mutationFn: (id: string) => service.download(id),
    retry: false,
  });
}
