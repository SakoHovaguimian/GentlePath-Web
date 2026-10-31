import { DomainError } from '@/errors/domainErrors';
export function goalUnavailable(error: unknown): boolean {
  return error instanceof DomainError && [401, 403, 404].includes(error.status);
}
