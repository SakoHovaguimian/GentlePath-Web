'use client';

import { useMutation } from '@tanstack/react-query';
import type { ContactService } from './services/contactService';
import type { ContactRequest } from './models/contactRequest';

export function useContactRequest(service: ContactService) {
  return useMutation({
    mutationFn: (input: ContactRequest) => service.send(input),
    retry: false,
  });
}
