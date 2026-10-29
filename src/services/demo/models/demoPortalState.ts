import type { ChildProfile } from '@/modules/portal/models/childProfile';
import type { JournalEntry } from '@/modules/portal/models/journalEntry';
import type { Resource } from '@/modules/portal/models/resource';
import type { Milestone } from '@/modules/portal/models/milestone';
import type { ModerationReport } from '@/modules/portal/models/moderationReport';
import type { PlatformSettings } from '@/modules/portal/models/platformSettings';
import type { DemoObservation } from './demoObservation';

export interface DemoPortalState {
  children: ChildProfile[];
  journals: JournalEntry[];
  resources: Resource[];
  milestones: Milestone[];
  observations: DemoObservation[];
  favorites: Map<string, Set<string>>;
  reports: ModerationReport[];
  settings: PlatformSettings;
}
