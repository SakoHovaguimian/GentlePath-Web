import type { ServiceApplicationStatus } from './serviceApplicationStatus';

export const activeApplicationStatuses = [
  'DRAFT',
  'APPLIED',
  'WAITLISTED',
] as const satisfies readonly ServiceApplicationStatus[];
