import type { ServiceApplication } from './serviceApplication';
import type { ApplicationFollowUp } from './applicationFollowUp';

export interface ApplicationDashboardItem {
  application: ServiceApplication;
  followUp?: ApplicationFollowUp;
}
