import type { ServiceApplication } from '../../models/serviceApplication';
import type { ApplicationFollowUp } from '../../models/applicationFollowUp';

export interface DemoApplicationState {
  applications: ServiceApplication[];
  followUps: ApplicationFollowUp[];
  fixtureVersion?: number;
}
