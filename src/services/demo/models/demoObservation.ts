import type { ObservationInput } from '@/modules/portal/models/milestone';

export interface DemoObservation extends ObservationInput {
  userId: string;
  milestoneId: string;
  observedAt: string;
}
